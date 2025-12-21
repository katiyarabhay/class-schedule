'use client';

import { useState, useRef, useEffect } from 'react';

interface MenuOption {
    label: string;
    onClick: () => void;
}

interface SplitButtonProps {
    label: string;
    onClick: () => void;
    menuOptions: MenuOption[];
    className?: string; // main button class
}

export default function SplitButton({ label, onClick, menuOptions, className = 'btn-primary' }: SplitButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'inline-flex',
                position: 'relative',
                verticalAlign: 'middle'
            }}
        >
            <button
                className={className}
                onClick={onClick}
                style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    marginRight: '1px'
                }}
            >
                {label}
            </button>
            <button
                className={className}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'var(--pk-surface)',
                    border: '1px solid var(--pk-border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    minWidth: '150px',
                    overflow: 'hidden'
                }}>
                    {menuOptions.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                option.onClick();
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: idx < menuOptions.length - 1 ? '1px solid var(--pk-border)' : 'none',
                                color: 'var(--pk-text)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
