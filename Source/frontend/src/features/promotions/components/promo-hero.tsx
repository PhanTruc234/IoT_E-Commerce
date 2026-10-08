'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { useActivePromotions } from '../hooks/use-promotions';

export function PromoHero() {
    const { data } = useActivePromotions();
    const promo = (data ?? []).find((p) => p.bannerImage) ?? (data ?? [])[0];
    if (!promo) return null;

    const ends = promo.endAt ? new Date(promo.endAt).toLocaleDateString('vi-VN') : null;

    return (
        <Link href={promo.linkUrl || '/products'}
            className="group relative mx-auto my-4 block max-w-7xl overflow-hidden rounded-2xl border border-red-100 bg-linear-to-r from-red-600 to-orange-500 px-6 py-8 text-white md:px-10 md:py-12">
            {promo.bannerImage && (
                <Image src={promo.bannerImage} alt={promo.name} fill sizes="100vw" className="object-cover opacity-30" />
            )}
            <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Khuyến mãi</span>
                <h2 className="mt-3 text-2xl font-bold md:text-4xl">{promo.name}</h2>
                {promo.description && <p className="mt-2 max-w-md text-sm text-white/90">{promo.description}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition group-hover:bg-red-50">
                        Mua ngay <ArrowRight className="h-4 w-4" />
                    </span>
                    {ends && <span className="inline-flex items-center gap-1 text-xs text-white/90"><Clock className="h-3.5 w-3.5" /> Đến hết {ends}</span>}
                </div>
            </div>
        </Link>
    );
}