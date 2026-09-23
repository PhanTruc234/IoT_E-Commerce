import { LegalSidebar } from '@/features/legal/components/legal-sidebar';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Pháp lý &amp; Chính sách</h1>
            <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="lg:w-72 lg:shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <LegalSidebar />
                    </div>
                </aside>
                <div className="min-w-0 flex-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
