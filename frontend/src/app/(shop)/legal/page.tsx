import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { POLICIES } from '@/shared/config/policies';

export const metadata: Metadata = {
    title: 'Pháp lý & Chính sách',
    description: 'Điều khoản sử dụng, bảo vệ dữ liệu, mua hàng, đổi trả, bảo hành, vận chuyển và thanh toán.',
    alternates: { canonical: '/legal' },
};

export default function LegalIndexPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold text-gray-900">Pháp lý & Chính sách</h1>
            <p className="mt-1 text-sm text-gray-500">Các điều khoản và chính sách bảo vệ quyền lợi của bạn.</p>
            <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {POLICIES.map((p) => (
                    <Link key={p.slug} href={`/legal/${p.slug}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50">
                        <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                        <span className="min-w-0 flex-1">
                            <span className="block font-medium text-gray-800">{p.title}</span>
                            <span className="block truncate text-xs text-gray-400">{p.summary}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                ))}
            </div>
        </div>
    );
}