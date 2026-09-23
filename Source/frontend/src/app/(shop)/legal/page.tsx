import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { POLICIES } from '@/shared/config/policies';

export const metadata: Metadata = {
    title: 'Pháp lý & Chính sách',
    description: 'Điều khoản sử dụng, bảo vệ dữ liệu, mua hàng, đổi trả, bảo hành, vận chuyển và thanh toán.',
    alternates: { canonical: '/legal' },
};

export default function LegalIndexPage() {
    return (
        <div>
            <h2 className="text-lg font-bold text-gray-900">Chính sách & điều khoản</h2>
            <p className="mt-1 text-sm text-gray-500">Chọn một mục ở danh sách bên trái, hoặc xem nhanh bên dưới.</p>
            <div className="mt-5 divide-y divide-gray-100">
                {POLICIES.map((p) => (
                    <Link key={p.slug} href={`/legal/${p.slug}`} className="flex items-center gap-3 py-3 hover:text-blue-600">
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
