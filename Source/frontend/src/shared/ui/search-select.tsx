'use client';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';

export interface SearchOption {
    value: string;
    label: string;
}

function fold(s: string) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
}

export function SearchSelect({
    options, value, onChange, placeholder, searchPlaceholder = 'Tìm kiếm…', emptyText = 'Không tìm thấy',
    disabled, loading, invalid, id,
}: {
    options: SearchOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    id?: string;
}) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);

    const selected = options.find((o) => o.value === value);
    const filtered = useMemo(() => {
        const q = fold(query.trim());
        return q ? options.filter((o) => fold(o.label).includes(q)) : options;
    }, [options, query]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const openList = () => {
        if (disabled) return;
        setQuery('');
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
    };
    const pick = (o: SearchOption) => {
        onChange(o.value);
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) pick(filtered[active]); }
        else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                id={id}
                onClick={() => (open ? setOpen(false) : openList())}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${invalid ? 'border-red-400' : 'border-gray-300'}`}
            >
                <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>{selected?.label ?? placeholder}</span>
                {loading
                    ? <Loader2 aria-hidden className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
                    : <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && (
                <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-3">
                        <Search aria-hidden className="h-4 w-4 shrink-0 text-gray-400" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                            onKeyDown={onKey}
                            placeholder={searchPlaceholder}
                            role="combobox"
                            aria-expanded
                            aria-controls={listId}
                            aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                            className="w-full py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
                        {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">{emptyText}</li>}
                        {filtered.map((o, i) => {
                            const isSelected = o.value === value;
                            return (
                                <li
                                    key={o.value}
                                    id={`${listId}-${i}`}
                                    data-index={i}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setActive(i)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(o)}
                                    className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${i === active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                >
                                    <span className="truncate">{o.label}</span>
                                    {isSelected && <Check aria-hidden className="h-4 w-4 shrink-0 text-blue-600" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}