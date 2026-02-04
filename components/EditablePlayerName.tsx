'use client';

import { useState, useEffect } from 'react';

type Props = {
    initialName: string;
    className?: string;
    onSave?: (newName: string) => void;
};

export default function EditablePlayerName({ initialName, className, onSave }: Props) {
    const [name, setName] = useState(initialName || '');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setName(initialName || '');
    }, [initialName]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (onSave) {
                onSave(name);
            }
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`bg-white border border-[#001f3f] text-[#001f3f] px-2 py-1 min-w-[120px] rounded-sm shadow-sm outline-none font-bold ${className || ''}`}
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <span
            onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
            }}
            className={`cursor-pointer group flex items-center gap-2 hover:bg-slate-50 py-1 px-2 -ml-2 rounded-sm transition-all border border-transparent hover:border-slate-200 ${className || ''}`}
            title="Click to edit name"
        >
            <span className="font-bold">{name || 'No Name'}</span>
            <svg
                className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </span>
    );
}
