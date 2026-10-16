'use client';
import { useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight, CalendarDays, Clock, Cloud, Cpu, Gift, Percent, Radio, ShieldCheck, ShoppingCart, Truck, Wifi,
    Zap, type LucideIcon,
} from 'lucide-react';
import type { ActivePromotion } from '../api/promotions.api';
import { Countdown } from '@/features/coupons/components/countdown';
import { bannerFont } from '../lib/banner-font';
import {
    isOptimizableImage, promoAmount, promoBadge, promoBadgeScope, promoDateRange, promoDiscountInfo, promoHref, promoScope,
    promoSubtitle,
} from '../lib/banner';

const TRUST: { icon: LucideIcon; lines: [string, string] }[] = [
    { icon: Truck, lines: ['Giao hàng', 'toàn quốc'] },
    { icon: ShieldCheck, lines: ['Sản phẩm', 'chính hãng'] },
    { icon: Gift, lines: ['Nhiều ưu đãi', 'hấp dẫn'] },
];

// Viền răng cưa của huy hiệu "-50K"; làm tròn 2 chữ số để server và trình duyệt vẽ giống hệt nhau
const SEAL_POINTS = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = i % 2 === 0 ? 50 : 45.5;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

/**
 * Một slide khuyến mãi.
 * - Có ảnh banner: ảnh làm NỀN toàn slide, chữ bên trái, huy hiệu + ô thông tin đè bên phải.
 * - Chưa có ảnh: nền xanh nhạt + cụm biểu tượng IoT trên bục.
 */
export function PromoSlide({ promo, mounted, priority }: { promo: ActivePromotion; mounted: boolean; priority: boolean }) {
    const bg = promo.bannerImage;
    const amount = promoAmount(promo);
    const range = promoDateRange(promo);
    const amountSize = amount.value.length > 7 ? 'text-[52px] sm:text-[72px] lg:text-[84px]' : 'text-[64px] sm:text-[88px] lg:text-[108px]';

    return (
        <div className={`${bannerFont.className} relative h-full overflow-hidden bg-[linear-gradient(115deg,#F6FAFF_0%,#E9F2FF_45%,#D5E5FF_100%)]`}>
            {bg ? (
                <>
                    {/* Máy tính: ảnh phủ toàn slide. Điện thoại: dải ảnh ở nửa dưới, mép trên mờ dần (ảnh ngang không bị phóng quá to) */}
                    <div className="absolute inset-x-0 bottom-0 h-80 [mask-image:linear-gradient(to_bottom,transparent,black_40%)] sm:h-96 lg:inset-0 lg:h-auto lg:[mask-image:none]">
                        <Image
                            src={bg}
                            alt=""
                            fill
                            priority={priority}
                            sizes="100vw"
                            unoptimized={!isOptimizableImage(bg)}
                            className="object-cover object-[78%_center] lg:object-right"
                        />
                    </div>
                    {/* Lớp trắng mờ phía chữ: chữ luôn dễ đọc dù ảnh nền thế nào */}
                    <div aria-hidden className="absolute inset-0 hidden bg-linear-to-r from-white/90 via-white/55 via-35% to-transparent to-60% lg:block" />
                </>
            ) : (
                <>
                    <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/70 blur-3xl" />
                    <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
                </>
            )}

            <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-5 pt-6 pb-14 sm:px-8 sm:pt-8 lg:grid-cols-[1.05fr_1fr] lg:px-16 lg:pt-10 lg:pb-12">
                {/* ===== Cột chữ ===== */}
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className="inline-flex items-center gap-2 bg-linear-to-r from-red-500 to-orange-500 py-2 pr-7 pl-5 text-sm font-bold tracking-wide text-white uppercase shadow-lg shadow-red-500/25"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
                        >
                            <Zap aria-hidden className="h-4 w-4 fill-white" />
                            {promo.name}
                        </span>
                        {range && (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-white/75 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-white backdrop-blur">
                                <CalendarDays aria-hidden className="h-4 w-4 text-slate-500" />
                                {range}
                            </span>
                        )}
                    </div>

                    <h2 className="mt-6">
                        <span className="block text-3xl font-bold text-[#0B1B4D] sm:text-[40px]">Giảm ngay</span>
                        <span className={`mt-1 flex items-start leading-[0.95] font-extrabold tracking-tight ${amountSize}`}>
                            <span className="bg-linear-to-b from-[#3B74FF] to-[#0A2BD1] bg-clip-text pb-2 text-transparent">{amount.value}</span>
                            <span className="mt-[0.12em] bg-linear-to-b from-[#3B74FF] to-[#0A2BD1] bg-clip-text text-[0.5em] text-transparent">{amount.unit}</span>
                        </span>
                    </h2>

                    <p className="relative mt-2 inline-block max-w-md text-xl font-bold text-[#0B1B4D] sm:text-2xl">
                        {promoSubtitle(promo)}
                        <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-3 left-0 h-3 w-full">
                            <path d="M3 9 C 70 3, 160 1, 297 6" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                    </p>

                    <ul className="mt-9 hidden flex-wrap items-center gap-y-3 sm:flex">
                        {TRUST.map(({ icon: Icon, lines }, i) => (
                            <li key={lines[0]} className={`flex items-center gap-3 pr-5 ${i > 0 ? 'border-l border-blue-200/70 pl-5' : ''}`}>
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-blue-100">
                                    <Icon aria-hidden className="h-5 w-5 text-blue-600" />
                                </span>
                                <span className="text-sm leading-tight font-medium text-slate-700">{lines[0]}<br />{lines[1]}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                        <Link
                            href={promoHref(promo)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#1D4ED8] to-[#1736D9] px-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:h-14 sm:px-9"
                        >
                            Mua ngay <ArrowRight aria-hidden className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/85 px-4 text-base font-semibold text-blue-700 ring-1 ring-blue-100 backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:h-14 sm:px-7"
                        >
                            Xem sản phẩm
                        </Link>
                    </div>
                </div>

                {/* ===== Cột phải ===== */}
                {bg ? (
                    // Ảnh nền đã có thiết bị → chỉ đặt huy hiệu ở trên, ô thông tin ở dưới
                    <div className="relative flex min-h-64 flex-col items-end justify-between gap-6 sm:min-h-72 lg:min-h-105 lg:self-stretch">
                        <SealBadge promo={promo} className="relative h-24 w-24 sm:h-32 sm:w-32" />
                        <InfoStrip promo={promo} mounted={mounted} range={range} className="w-full lg:max-w-xl" />
                    </div>
                ) : (
                    <div className="relative">
                        <div className="relative mx-auto h-48 max-w-xl sm:h-80 lg:h-90">
                            {/* Vòng sáng phía sau + bục */}
                            <div aria-hidden className="absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 translate-y-[-55%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.4)_55%,transparent_72%)] ring-1 ring-white/70" />
                            <div aria-hidden className="absolute bottom-1 left-1/2 h-14 w-[82%] -translate-x-1/2 rounded-[50%] bg-linear-to-b from-white to-[#D6E4FF] shadow-[0_24px_40px_-14px_rgba(30,64,175,0.45)]" />
                            <div aria-hidden className="absolute inset-x-0 bottom-8 flex items-end justify-center gap-4">
                                {[Cpu, Wifi, Radio].map((Icon, i) => (
                                    <span key={i} className={`flex items-center justify-center rounded-3xl bg-white/70 shadow-[0_18px_40px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white backdrop-blur ${i === 1 ? 'h-36 w-36 sm:h-44 sm:w-44' : 'h-24 w-24 sm:h-28 sm:w-28'}`}>
                                        <Icon className={i === 1 ? 'h-16 w-16 text-blue-600' : 'h-10 w-10 text-blue-500'} strokeWidth={1.8} />
                                    </span>
                                ))}
                            </div>
                            <GlassTile icon={Wifi} className="top-6 left-0 h-20 w-20" />
                            <GlassTile icon={Cloud} className="top-24 -right-4 h-16 w-16" />
                            <GlassTile icon={Cpu} className="bottom-20 -left-6 h-14 w-14" />
                            <SealBadge promo={promo} className="absolute -top-2 right-0 h-24 w-24 sm:h-36 sm:w-36 lg:right-6" />
                        </div>
                        <InfoStrip promo={promo} mounted={mounted} range={range} className="mt-2 lg:-mt-6 lg:-ml-8" />
                    </div>
                )}
            </div>
        </div>
    );
}

function GlassTile({ icon: Icon, className }: { icon: LucideIcon; className: string }) {
    return (
        <div aria-hidden className={`absolute hidden items-center justify-center rounded-2xl bg-white/45 shadow-[0_10px_30px_-8px_rgba(37,99,235,0.35)] ring-1 ring-white/80 backdrop-blur-md lg:flex ${className}`}>
            <Icon className="h-1/2 w-1/2 text-blue-500" strokeWidth={2.2} />
        </div>
    );
}

/** Huy hiệu răng cưa "-50K / cho tất cả sản phẩm" */
function SealBadge({ promo, className }: { promo: ActivePromotion; className: string }) {
    const sealId = useId();
    return (
        <div className={`-rotate-12 ${className}`}>
            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_12px_18px_rgba(29,78,216,0.4)]">
                <defs>
                    <linearGradient id={sealId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#1D3FD6" />
                    </linearGradient>
                </defs>
                <polygon points={SEAL_POINTS} fill={`url(#${sealId})`} />
            </svg>
            <span className="relative flex h-full flex-col items-center justify-center text-center text-white">
                <span className="text-2xl leading-none font-extrabold sm:text-[32px]">{promoBadge(promo)}</span>
                <span className="mt-1 max-w-[80%] text-[9px] leading-tight font-bold uppercase sm:text-[11px]">{promoBadgeScope(promo)}</span>
            </span>
        </div>
    );
}

/** Ô thông tin: mức giảm · phạm vi · thời gian còn lại */
function InfoStrip({ promo, mounted, range, className }: { promo: ActivePromotion; mounted: boolean; range: string | null; className: string }) {
    const discount = promoDiscountInfo(promo);
    return (
        <ul className={`relative z-10 grid grid-cols-[1fr_1fr_1.25fr] divide-x divide-blue-100 rounded-2xl bg-white/85 py-3 shadow-[0_14px_40px_-16px_rgba(30,64,175,0.45)] ring-1 ring-white backdrop-blur-md ${className}`}>
            <InfoItem icon={Percent} label={discount.label} value={discount.value} />
            <InfoItem icon={ShoppingCart} label="Áp dụng" value={promoScope(promo)} />
            <InfoItem
                icon={Clock}
                label={promo.endAt ? 'Kết thúc sau' : 'Thời gian'}
                value={promo.endAt ? (mounted ? <span className="whitespace-nowrap [&>span]:font-[inherit]"><Countdown to={promo.endAt} /></span> : range) : 'Đang diễn ra'}
            />
        </ul>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
    return (
        <li className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white sm:h-10 sm:w-10">
                <Icon aria-hidden className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="min-w-0">
                <span className="block text-[11px] text-slate-500 sm:text-xs">{label}</span>
                <span className="line-clamp-2 block text-xs leading-snug font-bold text-slate-900 sm:text-sm">{value}</span>
            </span>
        </li>
    );
}
