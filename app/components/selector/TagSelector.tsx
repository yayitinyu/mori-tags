import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { Tag } from '~/types';

interface TagSelectorProps {
    tags: Tag[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    categories: string[];
}

export function TagSelector({ tags, selectedTags, onToggleTag, categories }: TagSelectorProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'All');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState(100);

    // Reset limit when filter changes
    React.useEffect(() => {
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
                {visibleTags.map(tag => {
                    const isSelected = selectedTags.includes(tag.name_en);
                    return (
                        <button
                            key={tag.id}
                            onClick={() => onToggleTag(tag.name_en)}
                            className={`tag-chip ${isSelected ? 'selected' : ''}`}
                            style={{
                                padding: '6px 12px',
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
