import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
    return (
        <div className={`glass-card ${className}`} {...props}>
            {children}
        </div>
    );
}
