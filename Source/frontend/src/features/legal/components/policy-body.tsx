import type { PolicyDoc } from '@/shared/config/policies';

export function PolicyBody({ doc }: { doc: PolicyDoc }) {
    return (
        <article>
            <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
            <p className="mt-1 text-xs text-gray-400">Phiên bản {doc.version} · Cập nhật {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</p>
            <p className="mt-3 text-sm text-gray-600">{doc.summary}</p>
            <div className="mt-6 space-y-5">
                {doc.sections.map((s) => (
                    <section key={s.heading}>
                        <h2 className="text-base font-semibold text-gray-900">{s.heading}</h2>
                        {s.body.map((p, i) => (
                            <p key={i} className="mt-1.5 text-sm leading-relaxed text-gray-700">{p}</p>
                        ))}
                    </section>
                ))}
            </div>
        </article>
    );
}