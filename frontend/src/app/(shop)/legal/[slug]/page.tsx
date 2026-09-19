import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { POLICIES, getPolicy } from '@/shared/config/policies';
import { PolicyBody } from '@/features/legal/components/policy-body';

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const doc = getPolicy(slug);
    if (!doc) return { title: 'Không tìm thấy' };
    return { title: doc.title, description: doc.summary, alternates: { canonical: `/legal/${slug}` } };
}

export default async function LegalPage({ params }: Props) {
    const { slug } = await params;
    const doc = getPolicy(slug);
    if (!doc) notFound();
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <Link href="/legal" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" /> Pháp lý & Chính sách
            </Link>
            <PolicyBody doc={doc} />
        </div>
    );
}