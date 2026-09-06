import Link from 'next/link';
import { ArrowRight, BadgeCheck, Headphones, Package, ShieldCheck, Truck } from 'lucide-react';
import { CATEGORIES } from '@/shared/config/navigation';

const TRUST = [
    { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Nhanh chóng, đóng gói an toàn' },
    { icon: ShieldCheck, title: 'Bảo hành theo Serial', desc: 'Tra cứu bảo hành dễ dàng' },
    { icon: BadgeCheck, title: 'Hàng chính hãng', desc: 'Nguồn gốc rõ ràng' },
    { icon: Headphones, title: 'Hỗ trợ kỹ thuật', desc: 'Tư vấn IoT & linh kiện' },
];

export default function HomePage() {
    return (
        <>
            {/* Hero */}
            <section className="border-b border-gray-100 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
                    <div className="text-white">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                            <Package className="h-3.5 w-3.5" /> Thiết bị IoT & Linh kiện điện tử
                        </span>
                        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                            Mọi thứ cho dự án <br /> IoT của bạn
                        </h1>
                        <p className="mt-4 max-w-md text-blue-100">
                            ESP32, Arduino, Raspberry Pi, cảm biến, IC, linh kiện… đầy đủ và chính hãng.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                                Xem sản phẩm <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/products?category=combo"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Combo tiết kiệm
                            </Link>
                        </div>
                    </div>
                    <div className="hidden justify-center md:flex">
                        <div className="grid grid-cols-2 gap-4">
                            {CATEGORIES.slice(0, 4).map((c) => (
                                <div key={c.slug} className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur">
                                    <c.icon className="h-10 w-10 text-white" />
                                    <span className="text-center text-xs font-medium text-white">{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Cam kết */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {TRUST.map((t) => (
                        <div key={t.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <t.icon className="h-6 w-6 shrink-0 text-blue-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                                <p className="text-xs text-gray-500">{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Danh mục */}
            <section className="mx-auto max-w-7xl px-4 py-6">
                <h2 className="text-xl font-bold text-gray-900">Danh mục nổi bật</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                    {CATEGORIES.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/products?category=${c.slug}`}
                            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-4 text-center transition hover:border-blue-200 hover:shadow-sm"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                <c.icon className="h-6 w-6" />
                            </span>
                            <span className="text-xs font-medium text-gray-700">{c.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Sản phẩm nổi bật — nối API khi xong module Product */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
                    <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                        Xem tất cả <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                    <Package className="h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">Sẽ hiển thị khi hoàn thành module <b>Sản phẩm</b> (Feature ⑥).</p>
                </div>
            </section>
        </>
    );
}