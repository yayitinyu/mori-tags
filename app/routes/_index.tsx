import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link, Form, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { TagSelector } from "~/components/selector/TagSelector";
import { PromptBuilder } from "~/components/builder/PromptBuilder";
import { GlassCard } from "~/components/ui/GlassCard";
import { CollectionsList } from "~/components/collections/CollectionsList";
import type { Tag, Collection } from "~/types";
import { getUserId } from "~/utils/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const env = (context.cloudflare as any).env as { DB: D1Database };
    const userId = await getUserId(request);
    let user = null;
    let collections: Collection[] = [];

    if (userId) {
        user = await env.DB.prepare("SELECT id, username FROM users WHERE id = ?").bind(userId).first();
        if (user) {
            const result = await env.DB.prepare("SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all<Collection>();
            collections = result.results;
        }
    }

    const { results: systemTags } = await env.DB.prepare("SELECT * FROM tags ORDER BY category, name_en").all<Tag>();
    const tags = [...systemTags];

    if (user) {
        const { results: customTags } = await env.DB.prepare("SELECT * FROM custom_tags WHERE user_id = ? ORDER BY name").bind(user.id).all<any>();
        const formattedCustomTags: Tag[] = customTags.map(t => ({
            id: t.id,
            name_en: t.name,
            name_zh: t.name_zh || '', // Support Chinese name
            category: t.category || 'Custom', // Support Custom Category
            is_negative: false
        }));
        tags.push(...formattedCustomTags);
    }

    // Get unique categories
    // Get unique categories and sort consistently with frontend
    const categories = Array.from(new Set(tags.map(t => t.category))).sort((a, b) => {
        if (a === 'Custom') return 1;
        if (b === 'Custom') return -1;
        return a.localeCompare(b, 'zh-CN'); // Explicitly use zh-CN for consistency
    });

    return json({ tags, categories, user, collections });
};

import { GlassModal } from "~/components/ui/GlassModal";

export default function Index() {
    const { tags, categories, user, collections: serverCollections } = useLoaderData<typeof loader>();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);

    // Modal State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [collectionName, setCollectionName] = useState("");

    const fetcher = useFetcher();

    // Custom Tags State for Guest
    const [guestCustomTags, setGuestCustomTags] = useState<Tag[]>([]);

    // Combined Tags
    const allTags = user ? tags : [...tags, ...guestCustomTags];

    // Priority list for categories
    const categoryPriority: Record<string, number> = {
        "Custom": 999,
        "作品角色": 1, // Characters
        "角色": 1,
        "风格": 2, // Style
        "构图": 3, // Composition/Angle
        "衣装": 4, // Clothing
        "下身装饰": 5, // Legwear??
        "物品": 6, // Objects
        "背景": 7, // Background
        "R-18": 99,
        "限制级": 99
    };

    // Re-derive categories to include 'Custom' if present
    const allCategories = Array.from(new Set(allTags.map(t => t.category))).sort((a, b) => {
        if (a === 'All') return -1;
        const pA = categoryPriority[a] || 50;
        const pB = categoryPriority[b] || 50;
        if (pA !== pB) return pA - pB;
        return a.localeCompare(b, 'zh-CN');
    });

    // Sync collections (Server + LocalStorage for Guest)
    useEffect(() => {
        if (user) {
            setCollections(serverCollections);
        } else {
            const local = localStorage.getItem("guest_collections");
            if (local) {
                try {
                    setCollections(JSON.parse(local));
                } catch (e) {
                    console.error("Failed to parse local collections", e);
                }
            }
        }
    }, [user, serverCollections]);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
            setNotification("Success!");
            setTimeout(() => setNotification(null), 2000);
            setIsSaveModalOpen(false);
            setCollectionName("");
            // Clear input if it was a custom tag add? (Handled in TagSelector potentially)
        }
    }, [fetcher.state, fetcher.data]);

    // Load Guest Custom Tags
    useEffect(() => {
        if (!user) {
            try {
                const stored = localStorage.getItem("guest_custom_tags");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Patch legacy tags to have is_custom: true
                        const patched = parsed.map((t: any) => ({
                            ...t,
                            is_custom: true,
                            category: t.category || "Custom",
                            name_zh: t.name_zh || ""
                        }));
                        setGuestCustomTags(patched);
                        localStorage.setItem("guest_custom_tags", JSON.stringify(patched));
                    }
                }
            } catch (e) {
                console.error("Failed to load custom tags", e);
            }
        }
    }, [user]);

    const handleAddCustomTag = (name: string, category: string = 'Custom', name_zh: string = '') => {
        if (user) {
            fetcher.submit({ intent: "add", name, category, name_zh }, { method: "post", action: "/api/custom-tags" });
        } else {
            const newTag: Tag = {
                id: Date.now(),
                name_en: name,
                name_zh: name_zh,
                category: category,
                is_negative: false,
                is_custom: true
            };
            const updated = [...guestCustomTags, newTag];
            setGuestCustomTags(updated);
            localStorage.setItem("guest_custom_tags", JSON.stringify(updated));
        }
    };

    const handleDeleteCustomTag = (tag: Tag) => {
        if (!confirm(`Delete custom tag "${tag.name_en}"?`)) return;

        if (user) {
            fetcher.submit({ intent: "delete", id: tag.id.toString() }, { method: "post", action: "/api/custom-tags" });
        } else {
            const updated = guestCustomTags.filter(t => t.id !== tag.id);
            setGuestCustomTags(updated);
            localStorage.setItem("guest_custom_tags", JSON.stringify(updated));
            // Also remove from selected if present
            setSelectedTags(prev => prev.filter(t => t !== tag.name_en));
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const removeTag = (tag: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tag));
    };

    const clearTags = () => setSelectedTags([]);

    const copyTags = () => {
        const text = selectedTags.join(', ');
        navigator.clipboard.writeText(text).then(() => {
            setNotification("Copied to clipboard!");
            setTimeout(() => setNotification(null), 2000);
        });
    };

    const handleSaveClick = () => {
        setIsSaveModalOpen(true);
    };

    const confirmSaveCollection = () => {
        if (!collectionName.trim()) {
            alert("Please enter a name.");
            return;
        }

        if (user) {
            fetcher.submit(
                { intent: "save", name: collectionName, tags: selectedTags.join(', ') },
                { method: "post", action: "/api/collections" }
            );
        } else {
            // Guest Mode Save
            const newCol: Collection = {
                id: Date.now(), // Generate rough ID
                user_id: 0,
                name: collectionName,
                tags_string: selectedTags.join(', '),
                tags_count: selectedTags.length,
                preview_image_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const updated = [newCol, ...collections];
            setCollections(updated);
            localStorage.setItem("guest_collections", JSON.stringify(updated));
            setNotification("Collection Saved (Guest)!");
            setTimeout(() => setNotification(null), 2000);
            setIsSaveModalOpen(false);
            setCollectionName("");
        }
    };

    const deleteCollection = (id: number) => {
        // We could use a modal here too, but native confirm is safer/faster for destructive actions?
        // User asked to "redo confirmation popup... using system native feels rough".
        // Let's use native confirm for delete to save time, or we need another state for Delete Modal.
        // The user specifically asked "reload of collection confirm popup... currently usage native feels rough". 
        // Oh wait, they meant the prompt "save collection" popup was native.
        // For delete, I will just use native confirm for now to keep complexity down, OR I can reuse the modal or implement a quick custom confirm.
        // Given complexity, let's use window.confirm but the "Save" is now the nice GlassModal.
        if (!confirm("Are you sure you want to delete this collection?")) return;

        if (user) {
            fetcher.submit(
                { intent: "delete", id: id.toString() },
                { method: "post", action: "/api/collections" }
            );
        } else {
            const updated = collections.filter(c => c.id !== id);
            setCollections(updated);
            localStorage.setItem("guest_collections", JSON.stringify(updated));
            setNotification("Collection Deleted!");
            setTimeout(() => setNotification(null), 2000);
        }
    };

    return (
        <div className="container">
            <header className="main-header" style={{
                marginBottom: '2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ width: '100px', display: 'none' }} className="desktop-only"></div>
                <div>
                    <h1 style={{ color: 'var(--deep-pink)', marginBottom: '0.5rem' }}>Mori Tags</h1>
                    <p style={{ color: '#666' }}>AI Drawing Tag Manager</p>
                </div>
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                    {user ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <Link to="/settings" style={{ fontSize: '0.9rem', color: 'var(--deep-pink)', textDecoration: 'none', fontWeight: 'bold' }}>
                                {user.username}
                            </Link>
                            <Form action="/logout" method="post">
                                <button type="submit" className="btn btn-glass" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Logout</button>
                            </Form>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
                    )}
                </div>
            </header>

            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px',
                    background: 'var(--deep-pink)', color: 'white',
                    padding: '10px 20px', borderRadius: '8px', zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {notification}
                </div>
            )}

            <div className="dashboard-grid">
                <div className="main-content" style={{ minWidth: 0 }}>
                    <GlassCard>
                        <TagSelector
                            tags={allTags}
                            selectedTags={selectedTags}
                            onToggleTag={toggleTag}
                            categories={allCategories}
                            onAddCustomTag={handleAddCustomTag}
                            onDeleteCustomTag={handleDeleteCustomTag}
                        />
                    </GlassCard>
                </div>

                <div className="sidebar">
                    <PromptBuilder
                        selectedTags={selectedTags}
                        clearTags={clearTags}
                        copyTags={copyTags}
                        removeTag={removeTag}
                    />

                    <div style={{ marginTop: '1rem' }}>
                        {selectedTags.length > 0 && (
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveClick}>
                                Save as Collection
                            </button>
                        )}
                    </div>

                    <CollectionsList
                        collections={collections}
                        onSelect={setSelectedTags}
                        onDelete={deleteCollection}
                        isLoggedIn={!!user}
                        allTags={tags}
                    />
                </div>
            </div>

            {/* Save Collection Modal */}
            <GlassModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                title="Save Collection"
            >
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                            Collection Name
                        </label>
                        <input
                            type="text"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            placeholder="e.g., Cat Girl Theme"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            autoFocus
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-glass"
                            onClick={() => setIsSaveModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={confirmSaveCollection}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
