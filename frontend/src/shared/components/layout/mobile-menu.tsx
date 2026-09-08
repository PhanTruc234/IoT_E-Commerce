'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { CATEGORIES } from '@/shared/config/navigation';

export function MobileMenu() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-label="Mở menu"
                className="cursor-pointer rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 md:hidden"
            >
                <Menu className="h-6 w-6" />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">Danh mục</span>
                            <button onClick={() => setOpen(false)} aria-label="Đóng" className="cursor-pointer rounded-lg p-1 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="mt-4 flex flex-col">
                            {CATEGORIES.map((c) => (
                                <Link
                                    key={c.slug}
                                    href={`/products?category=${c.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <c.icon className="h-5 w-5 text-blue-600" />
                                    {c.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}