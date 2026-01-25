'use client';

import { useState, useEffect } from 'react';

type Props = {
    initialName: string;
    className?: string;
    onSave?: (newName: string) => void;
};

export default function EditablePlayerName({ initialName, className, onSave }: Props) {
    const [name, setName] = useState(initialName);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setName(initialName);
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
                className={`bg-white border text-black px-1 py-0.5 min-w-[100px] ${className}`}
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <span
            onClick={(e) => {
                // Simple click to edit, assuming name is not a link anymore
                e.preventDefault();
                setIsEditing(true);
            }}
            className={`cursor-pointer hover:bg-yellow-100 hover:text-black border border-transparent hover:border-slate-200 rounded px-1 -ml-1 transition-all ${className}`}
            title="Click to edit"
        >
            {name}
        </span>
    );
}
