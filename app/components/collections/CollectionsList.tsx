import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { Collection, Tag } from '~/types';

interface CollectionsListProps {
    collections: Collection[];
    onSelect: (tags: string[]) => void;
    onDelete: (id: number) => void;
    isLoggedIn: boolean;
    allTags?: Tag[];
}

export function CollectionsList({ collections, onSelect, onDelete, isLoggedIn, allTags = [] }: CollectionsListProps) {
    // Guest mode now shows collections too, passed from parent

    // Helper to get preview
    const getPreviewImage = (tagsString: string) => {
        const tags = tagsString.split(', ');
        for (const t of tags) {
            const tagData = allTags.find(at => at.name_en === t);
            if (tagData && tagData.image_url) {
                return tagData.image_url;
            }
        }
        return null;
    };

    const handleCopy = (tagsString: string) => {
        navigator.clipboard.writeText(tagsString).then(() => {
            // Optional: toast or feedback could be handled by parent if callback provided, 
            // but for now simple browser confirm or silent is fine, or we assume user knows.
            // Better to trigger a callback if we want global notification.
            alert("Tags copied to clipboard!");
        });
    };

    return (
        <GlassCard style={{ marginTop: '1rem' }}>
            <h3>{isLoggedIn ? "My Collections" : "Guest Collections"}</h3>
            {!isLoggedIn && (
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                    Saved to browser local storage. <a href="/login">Login</a> to sync.
                </p>
            )}

            {collections.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No saved collections yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {collections.map(col => {
                        const previewUrl = getPreviewImage(col.tags_string);
                        return (
                            <div key={col.id} className="glass-panel" style={{ padding: '8px', borderRadius: '8px', position: 'relative' }}>
                                <div style={{ fontWeight: 'bold', paddingRight: '20px' }}>{col.name}</div>

                                {previewUrl && previewUrl.startsWith('http') && (
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px', marginTop: '4px' }} />
                                )}

                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                                    {col.tags_string.length > 50 ? col.tags_string.substring(0, 50) + '...' : col.tags_string}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                                        onClick={() => onSelect(col.tags_string.split(', '))}
                                    >
                                        Load
                                    </button>
                                    <button
                                        className="btn btn-glass"
                                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                        onClick={() => handleCopy(col.tags_string)}
                                        title="Copy Tags"
                                    >
                                        📋
                                    </button>
                                    <button
                                        className="btn btn-glass"
                                        style={{ fontSize: '0.8rem', padding: '6px 12px', color: 'red', borderColor: 'rgba(255,0,0,0.3)' }}
                                        onClick={() => onDelete(col.id)}
                                        title="Delete Collection"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </GlassCard>
    );
}
