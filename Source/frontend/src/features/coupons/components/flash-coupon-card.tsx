'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    AlarmClock, BadgePercent, Ban, BellRing, Check, Clock, Copy, Download, Flame, Loader2, Ticket, Truck, type LucideIcon,
} from 'lucide-react';
import type { FlashCoupon } from '../api/coupons.api';
import { Countdown } from './countdown';
import {
    couponClaimed, couponMinOrder, couponProgress, couponScope, couponStub, couponTheme, couponTitle,
} from '../lib/flash';

const STATUS: Record<FlashCoupon['status'], { label: string; icon: LucideIcon }> = {
    LIVE: { label: 'Đang diễn ra', icon: Flame },
    UPCOMING: { label: 'Sắp mở', icon: AlarmClock },
    SOLD_OUT: { label: 'Đã hết', icon: Ban },
};

function formatTime(iso: string) {
    return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export function FlashCouponCard({
    coupon: c, index, claiming, error, onClaim, onTimerEnd,
}: {
    coupon: FlashCoupon;
    index: number;
    claiming: boolean;
    error?: string;
    onClaim: () => void;
    onTimerEnd: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const theme = couponTheme(c, index);
    const stub = couponStub(c);
    const status = STATUS[c.status];
    const canClaim = c.status === 'LIVE' && !c.claimed && (c.remaining == null || c.remaining > 0);

    const copy = async () => {
        if (!c.code) return;
        try {
            await navigator.clipboard.writeText(c.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { }
    };

    const time =
        c.status === 'UPCOMING' && c.claimStartAt ? (
            <>Mở sau <TimeLeft to={c.claimStartAt} className="text-blue-600" onEnd={onTimerEnd} /></>
        ) : c.status === 'LIVE' && c.claimEndAt ? (
            <>Còn <TimeLeft to={c.claimEndAt} className="text-red-600" onEnd={onTimerEnd} /></>
        ) : c.status === 'SOLD_OUT' ? (
            <>Đã hết lượt săn</>
        ) : c.endAt ? (
            <>Hạn dùng đến <b className="font-semibold text-slate-700">{formatTime(c.endAt)}</b></>
        ) : (
            <>Không giới hạn thời gian</>
        );

    const btn = 'flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition';

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)] ring-1 ring-slate-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(15,23,42,0.32)]">
            <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-br-2xl bg-linear-to-r ${theme.gradient} py-1.5 pr-4 pl-3 text-[11px] font-bold tracking-wide text-white uppercase`}>
                    <status.icon aria-hidden className="h-3.5 w-3.5" />
                    {status.label}
                </span>
                <span className={`mt-2 mr-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.soft}`}>
                    <Ticket aria-hidden className="h-3.5 w-3.5" />
                    Đã lấy {couponClaimed(c)}
                </span>
            </div>

            <div className="flex gap-3 px-3 pt-3 pb-2">

                <div className={`relative flex w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-linear-to-br ${theme.gradient} px-2 py-4 text-center text-white`}>
                    {stub.freeship ? (
                        <>
                            <Truck aria-hidden className="h-8 w-8" strokeWidth={1.8} />
                            <span className="mt-1 text-xs font-extrabold tracking-wide">FREESHIP</span>
                        </>
                    ) : (
                        <span className="text-[28px] leading-none font-extrabold tracking-tight">{stub.big}</span>
                    )}
                    {stub.sub && <span className="mt-1.5 text-[10px] leading-tight font-medium text-white/90">{stub.sub}</span>}

                    <span aria-hidden className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rounded-full bg-white" />
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                    <h3 className="text-base font-bold text-slate-900">{couponTitle(c)}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{couponMinOrder(c)}</p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
                        <Clock aria-hidden className="h-3.5 w-3.5 shrink-0" />
                        {time}
                    </p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500">
                        <BadgePercent aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
                        <span>Áp dụng: <span className="font-medium text-slate-700">{couponScope(c)}</span></span>
                    </p>
                </div>
            </div>

            {c.claimLimit != null && (
                <div
                    className="mx-3 mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label="Số mã đã được lấy"
                    aria-valuenow={couponProgress(c)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div className={`h-full rounded-full bg-linear-to-r ${theme.bar} transition-[width] duration-500`} style={{ width: `${couponProgress(c)}%` }} />
                </div>
            )}

            <div className="mt-auto p-3">
                {c.claimed && c.code ? (

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={copy}
                            aria-label={`Sao chép mã ${c.code}`}
                            className="flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 font-mono text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                            <span className="truncate">{c.code}</span>
                            {copied ? <Check aria-hidden className="h-4 w-4 shrink-0" /> : <Copy aria-hidden className="h-4 w-4 shrink-0" />}
                        </button>
                        <Link href="/products" className="flex h-11 shrink-0 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
                            Dùng ngay
                        </Link>
                    </div>
                ) : canClaim ? (
                    <button
                        type="button"
                        onClick={onClaim}
                        disabled={claiming}
                        className={`${btn} cursor-pointer bg-linear-to-r ${theme.gradient} text-white shadow-lg ${theme.shadow} hover:brightness-110 disabled:cursor-wait disabled:opacity-70`}
                    >
                        {claiming ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Download aria-hidden className="h-4 w-4" />}
                        {claiming ? 'Đang lấy mã…' : 'Lấy mã'}
                    </button>
                ) : c.status === 'UPCOMING' ? (
                    <div className={`${btn} bg-blue-50 text-blue-700`}>
                        <BellRing aria-hidden className="h-4 w-4" />
                        {c.claimStartAt ? `Mở lúc ${formatTime(c.claimStartAt)}` : 'Sắp mở'}
                    </div>
                ) : (
                    <div className={`${btn} bg-slate-100 text-slate-400`}>
                        <Ban aria-hidden className="h-4 w-4" />
                        Đã hết mã
                    </div>
                )}
                {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
            </div>
        </article>
    );
}

function TimeLeft({ to, className, onEnd }: { to: string; className: string; onEnd: () => void }) {
    return (
        <b className={`font-bold tabular-nums [&>span]:font-[inherit] ${className}`}>
            <Countdown to={to} onEnd={onEnd} />
        </b>
    );
}
