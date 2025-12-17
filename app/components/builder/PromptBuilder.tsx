import React from 'react';
import { GlassCard } from '../ui/GlassCard';

interface PromptBuilderProps {
    selectedTags: string[];
    clearTags: () => void;
    copyTags: () => void;
    removeTag: (tag: string) => void;
}

export function PromptBuilder({ selectedTags, clearTags, copyTags, removeTag }: PromptBuilderProps) {
    return (
        <GlassCard className="prompt-builder" style={{ position: 'sticky', top: '1rem', zIndex: 10 }}>
            <h3>Current Prompt</h3>
            <div className="prompt-area glass-panel" style={{
                minHeight: '100px',
                padding: '1rem',
                margin: '1rem 0',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.7)'
            }}>
                {selectedTags.length === 0 ? (
                    <span style={{ color: '#888' }}>Select tags to build your prompt...</span>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {selectedTags.map(tag => (
                            <span key={tag} style={{
                                background: 'var(--secondary-pink)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {tag}
                                <button onClick={() => removeTag(tag)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--deep-pink)' }}>×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="actions" style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={copyTags}>Copy Prompt</button>
                <button className="btn btn-glass" onClick={clearTags}>Clear</button>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                {selectedTags.join(', ')}
            </div>
        </GlassCard>
    );
}
