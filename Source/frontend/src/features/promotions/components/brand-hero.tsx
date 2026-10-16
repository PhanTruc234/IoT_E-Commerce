import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { CATEGORIES } from '@/shared/config/navigation';

export function BrandHero() {
    return (
        <div className="flex h-full items-center bg-linear-to-br from-blue-600 to-indigo-700">
            <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24 lg:px-16">
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
        </div>
    );
}
