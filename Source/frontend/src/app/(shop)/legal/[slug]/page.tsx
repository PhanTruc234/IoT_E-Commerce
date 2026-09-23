import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    return <PolicyBody doc={doc} />;
}
