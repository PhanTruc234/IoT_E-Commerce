'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    AlarmClock, ArrowRight, Ban, Clock, Flame, History, LayoutGrid, LogIn, TicketX, Zap, type LucideIcon,
} from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { loginUrl } from '@/shared/lib/safe-next';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useFlashCoupons, useClaimCoupon } from '@/features/coupons/hooks/use-coupons';
import { FlashCouponCard } from '@/features/coupons/components/flash-coupon-card';
import { CouponRow } from '@/features/coupons/components/coupon-row';
import type { FlashCoupon } from '@/features/coupons/api/coupons.api';

type Status = FlashCoupon['status'];
type Tab = 'ALL' | Status;

const SECTIONS: { key: Status; title: string; desc: string; icon: LucideIcon; iconCls: string }[] = [
    { key: 'LIVE', title: 'Đang diễn ra', desc: 'Nhanh tay lấy mã trước khi hết lượt!', icon: Flame, iconCls: 'bg-orange-50 text-orange-500' },
    { key: 'UPCOMING', title: 'Sắp mở', desc: 'Canh đúng giờ để săn mã sớm nhất', icon: AlarmClock, iconCls: 'bg-blue-50 text-blue-600' },
    { key: 'SOLD_OUT', title: 'Đã hết', desc: 'Hẹn bạn ở đợt săn mã tiếp theo', icon: Ban, iconCls: 'bg-slate-100 text-slate-500' },
];

// Khách bấm "Lấy mã" khi chưa đăng nhập → nhớ mã đó, đăng nhập xong quay lại tự lấy
const PENDING_KEY = 'iotech:pending-claim';

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : Number.MAX_SAFE_INTEGER);

export default function FlashSalePage() {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const isAuthed = status === 'authenticated';
    const { data, isLoading, refetch } = useFlashCoupons();
    const claim = useClaimCoupon();
    const { mutate: claimMutate } = claim;
    const [tab, setTab] = useState<Tab>('ALL');

    useEffect(() => {
        if (status !== 'authenticated') return;
        let pending: string | null = null;
        try {
            pending = sessionStorage.getItem(PENDING_KEY);
            sessionStorage.removeItem(PENDING_KEY);
        } catch {
            // trình duyệt chặn sessionStorage
        }
        if (pending) claimMutate(pending);
    }, [status, claimMutate]);

    const onClaim = (c: FlashCoupon) => {
        if (!isAuthed) {
            try { sessionStorage.setItem(PENDING_KEY, c.id); } catch { /* bỏ qua */ }
            router.push(loginUrl('/flash-sale'));
            return;
        }
        claim.mutate(c.id);
    };

    // Nhóm theo trạng thái; đang mở xếp mã sắp hết giờ lên trước, sắp mở xếp mã mở sớm lên trước
    const { groups, colorIndex } = useMemo(() => {
        const list = data ?? [];
        const colorIndex = new Map(list.map((c, i) => [c.id, i]));
        const groups: Record<Status, FlashCoupon[]> = {
            LIVE: list.filter((c) => c.status === 'LIVE').sort((a, b) => time(a.claimEndAt) - time(b.claimEndAt)),
            UPCOMING: list.filter((c) => c.status === 'UPCOMING').sort((a, b) => time(a.claimStartAt) - time(b.claimStartAt)),
            SOLD_OUT: list.filter((c) => c.status === 'SOLD_OUT'),
        };
        return { groups, colorIndex };
    }, [data]);

    const total = data?.length ?? 0;
    const tabs: { key: Tab; label: string; count: number; icon?: LucideIcon; dot?: boolean }[] = [
        { key: 'ALL', label: 'Tất cả', count: total, icon: LayoutGrid },
        { key: 'LIVE', label: 'Đang diễn ra', count: groups.LIVE.length, dot: true },
        { key: 'UPCOMING', label: 'Sắp mở', count: groups.UPCOMING.length, icon: Clock },
        { key: 'SOLD_OUT', label: 'Đã hết', count: groups.SOLD_OUT.length, icon: Ban },
    ];

    const renderCard = (c: FlashCoupon) => (
        <FlashCouponCard
            key={c.id}
            coupon={c}
            index={colorIndex.get(c.id) ?? 0}
            claiming={claim.isPending && claim.variables === c.id}
            error={claim.isError && claim.variables === c.id ? getApiErrorMessage(claim.error) : undefined}
            onClaim={() => onClaim(c)}
            onTimerEnd={() => refetch()}
        />
    );

    return (
        <div className="bg-slate-50/70">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                            <Zap aria-hidden className="h-6 w-6 fill-amber-400 text-amber-500" /> Săn mã giảm giá
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">Mã phát theo khung giờ, số lượng có hạn. Lấy xong mã nằm sẵn trong ví, dùng ngay khi thanh toán.</p>
                    </div>
                    {!isAuthed && status !== 'loading' && (
                        <Link href={loginUrl('/flash-sale')} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100">
                            <LogIn aria-hidden className="h-4 w-4" /> Đăng nhập để lấy mã
                        </Link>
                    )}
                </div>

                {/* Thanh lọc theo trạng thái */}
                <div className="-mx-4 mt-6 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Lọc mã theo trạng thái">
                    {tabs.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(t.key)}
                                className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition sm:px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active ? 'bg-linear-to-r from-[#3B7BFF] to-[#1D4ED8] text-white shadow-md shadow-blue-600/25' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
                            >
                                {t.dot ? (
                                    <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-white' : 'bg-emerald-500'}`} />
                                ) : t.icon ? (
                                    <t.icon aria-hidden className="h-4 w-4" />
                                ) : null}
                                {t.label} ({t.count})
                            </button>
                        );
                    })}
                    <Link
                        href="/vouchers"
                        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold whitespace-nowrap text-slate-700 sm:ml-auto sm:px-5 ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                        <History aria-hidden className="h-4 w-4" /> Lịch sử săn mã
                    </Link>
                </div>

                <div className="mt-8">
                    {isLoading || status === 'loading' ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-60 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />)}
                        </div>
                    ) : total === 0 ? (
                        <EmptyState />
                    ) : tab === 'ALL' ? (
                        <div className="space-y-10">
                            {SECTIONS.filter((s) => groups[s.key].length > 0).map((s) => (
                                <section key={s.key} aria-labelledby={`sec-${s.key}`}>
                                    <div className="mb-4 flex items-end justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconCls}`}>
                                                <s.icon aria-hidden className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <h2 id={`sec-${s.key}`} className="text-lg font-bold text-slate-900">{s.title}</h2>
                                                <p className="text-sm text-slate-500">{s.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTab(s.key)}
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                                        >
                                            Xem tất cả <ArrowRight aria-hidden className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <CouponRow label={s.title}>{groups[s.key].map(renderCard)}</CouponRow>
                                </section>
                            ))}
                        </div>
                    ) : groups[tab].length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
                            Không có mã nào ở mục này.{' '}
                            <button type="button" onClick={() => setTab('ALL')} className="cursor-pointer font-semibold text-blue-600 hover:underline">Xem tất cả mã</button>
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{groups[tab].map(renderCard)}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <TicketX aria-hidden className="h-7 w-7" />
            </span>
            <p className="mt-4 font-semibold text-slate-800">Hiện chưa có đợt săn mã nào</p>
            <p className="mt-1 text-sm text-slate-500">Các đợt săn mã mới sẽ được báo qua chuông thông báo. Trong lúc chờ, bạn xem thử mã trong ví nhé.</p>
            <div className="mt-5 flex gap-3">
                <Link href="/vouchers" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Xem ví mã</Link>
                <Link href="/products" className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Mua sắm</Link>
            </div>
        </div>
    );
}
