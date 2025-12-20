import { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { Tag } from '~/types';

// ... props updated below
interface TagSelectorProps {
    tags: Tag[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    categories: string[];
    onAddCustomTag?: (name: string, category?: string, name_zh?: string) => void;
    onDeleteCustomTag?: (tag: Tag) => void;
}

export function TagSelector({ tags, selectedTags, onToggleTag, categories, onAddCustomTag, onDeleteCustomTag }: TagSelectorProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'All');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState(100);
    const [customTagName, setCustomTagName] = useState("");
    const [addCategory, setAddCategory] = useState("Custom");
    const [addNameZH, setAddNameZH] = useState("");

    // Reset limit when filter changes
    useEffect(() => {
        setDisplayLimit(100);
    }, [activeCategory, searchTerm]);

    const filteredTags = tags.filter(tag => {
        const matchesCategory = activeCategory === 'All' || tag.category === activeCategory;
        const matchesSearch = tag.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tag.name_zh && tag.name_zh.includes(searchTerm));
        return matchesCategory && matchesSearch;
    });

    const visibleTags = filteredTags.slice(0, displayLimit);
    const hasMore = filteredTags.length > displayLimit;

    const loadMore = () => {
        setDisplayLimit(prev => prev + 100);
    };

    const handleAdd = () => {
        if (customTagName.trim() && onAddCustomTag) {
            onAddCustomTag(customTagName.trim());
            setCustomTagName("");
        }
    };

    return (
        <div className="tag-selector" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <div className="categories-bar custom-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0', marginBottom: '1rem', whiteSpace: 'nowrap' }}>
                <button
                    className={`btn ${activeCategory === 'All' ? 'btn-primary' : 'btn-glass'}`}
                    onClick={() => setActiveCategory('All')}
                    style={{ flexShrink: 0 }}
                >
                    全部
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-glass'}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{ flexShrink: 0 }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Custom Tag Management UI */}
            {activeCategory === 'Custom' && onAddCustomTag && (
                <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--deep-pink)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--deep-pink)' }}>Create New Tag</h4>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Tag Name (English)</label>
                            <input
                                type="text"
                                placeholder="e.g. cat_ears"
                                value={customTagName}
                                onChange={e => setCustomTagName(e.target.value)}
                                className="glass-panel"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Chinese Name (Optional)</label>
                            <input
                                type="text"
                                className="glass-panel"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                value={addNameZH}
                                onChange={e => setAddNameZH(e.target.value)}
                                placeholder="e.g. 猫耳"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Category</label>
                            <select
                                className="glass-panel"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                value={addCategory}
                                onChange={e => setAddCategory(e.target.value)}
                            >
                                <option value="Custom">Custom</option>
                                {categories.filter(c => c !== 'Custom' && c !== 'All').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                if (customTagName.trim()) {
                                    onAddCustomTag(customTagName.trim(), addCategory, addNameZH);
                                    setCustomTagName("");
                                    setAddNameZH("");
                                }
                            }}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Add Tag
                        </button>
                    </div>
                </div>
            )}

            {/* Search Bar (Hide if Custom? Maybe keep it) */}
            {activeCategory !== 'Custom' && (
                <div className="search-bar" style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search tags..."
                        className="glass-panel"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid white' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}

            <div
                className="tags-grid custom-scrollbar"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    alignContent: 'flex-start',
                    paddingRight: '4px'
                }}
            >
                {/* Custom Tag Add via Search */}
                {searchTerm && onAddCustomTag && (
                    <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                        <button
                            onClick={() => {
                                if (onAddCustomTag) {
                                    onAddCustomTag(searchTerm);
                                    setSearchTerm('');
                                }
                            }}
                            className="btn btn-glass"
                            style={{ width: '100%', textAlign: 'left', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--deep-pink)' }}
                        >
                            <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>+</span>
                            <span>Create custom tag: <strong>{searchTerm}</strong></span>
                        </button>
                    </div>
                )}

                {visibleTags.map(tag => {
                    const isSelected = selectedTags.includes(tag.name_en);
                    return (
                        <div key={`${tag.category}-${tag.id}`} style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                                onClick={() => onToggleTag(tag.name_en)}
                                className={`tag-chip ${isSelected ? 'selected' : ''}`}
                                style={{
                                    padding: '6px 12px',
                                    paddingRight: (tag.is_custom || tag.category === 'Custom') ? '32px' : '12px',
                                    borderRadius: '20px',
                                    border: isSelected ? '2px solid var(--deep-pink)' : '1px solid white',
                                    background: isSelected ? 'rgba(214, 51, 132, 0.2)' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <span style={{ fontWeight: 'bold' }}>{tag.name_en}</span>
                                {tag.name_zh && <span style={{ fontSize: '0.8em', marginLeft: '6px', opacity: 0.8 }}>{tag.name_zh}</span>}
                            </button>
                            {(tag.is_custom || tag.category === 'Custom') && onDeleteCustomTag && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteCustomTag(tag); }}
                                    style={{
                                        position: 'absolute',
                                        right: '4px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        border: 'none',
                                        color: '#cc0033',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        lineHeight: 1,
                                        zIndex: 10
                                    }}
                                    className="custom-delete-btn"
                                    title="Delete this custom tag"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    );
                })}

                {hasMore && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={loadMore}
                            className="btn btn-glass"
                            style={{
                                width: '50%',
                                padding: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            Load More ... ({filteredTags.length - displayLimit} remaining)
                        </button>
                    </div>
                )}

                {filteredTags.length === 0 && (
                    <div style={{ padding: '20px', color: '#666', textAlign: 'center', width: '100%' }}>
                        No tags found.
                    </div>
                )}
            </div>
        </div>
    );
}

// Add a style tag or similar for hover effect on delete button if desired, but inline is fine.
