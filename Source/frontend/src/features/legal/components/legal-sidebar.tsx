'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';
import { POLICIES } from '@/shared/config/policies';

export function LegalSidebar() {
    const pathname = usePathname();
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-2">
            <Link
                href="/legal"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/legal' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                Tất cả chính sách
            </Link>
            <div className="my-1 border-t border-gray-100" />
            <nav className="space-y-0.5">
                {POLICIES.map((p) => {
                    const href = `/legal/${p.slug}`;
                    const active = pathname === href;
                    return (
                        <Link
                            key={p.slug}
                            href={href}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FileText className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="min-w-0 truncate">{p.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
