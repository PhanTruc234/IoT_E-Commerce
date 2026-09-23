'use client';
import { Star } from 'lucide-react';

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
    return (
        <span className="inline-flex">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} style={{ width: size, height: size }}
                    className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
            ))}
        </span>
    );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <span className="inline-flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => onChange(n)} className="cursor-pointer">
                    <Star className={`h-7 w-7 ${n <= value ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 hover:text-amber-300'}`} />
                </button>
            ))}
        </span>
    );
}