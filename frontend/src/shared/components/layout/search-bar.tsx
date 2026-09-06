'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
    const router = useRouter();
    const [q, setQ] = useState('');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const term = q.trim();
                if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
            }}
            className="relative w-full"
            role="search"
        >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm ESP32, cảm biến, Arduino…"
                aria-label="Tìm kiếm sản phẩm"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
        </form>
    );
}