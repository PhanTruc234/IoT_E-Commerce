'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, Loader2, Check } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useFlashCoupons, useClaimCoupon } from '@/features/coupons/hooks/use-coupons';
import { Countdown } from '@/features/coupons/components/countdown';
import type { FlashCoupon } from '@/features/coupons/api/coupons.api';

function describe(c: FlashCoupon): string {
    if (c.type === 'FREE_SHIPPING') return c.value > 0 ? `Giảm tối đa ${formatVnd(c.value)} phí ship` : 'Miễn phí vận chuyển';
    const base = c.discountType === 'PERCENT' ? `Giảm ${c.value}%` : `Giảm ${formatVnd(c.value)}`;
    const cap = c.discountType === 'PERCENT' && c.maxDiscount ? ` (tối đa ${formatVnd(c.maxDiscount)})` : '';
    return base + cap;
}

export default function FlashSalePage() {
    const router = useRouter();
    const status = useAuthStore((s) => s.status);
    const { data, isLoading, refetch } = useFlashCoupons();
    const claim = useClaimCoupon();

    useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
                <h1 className="flex items-center gap-2 text-2xl font-bold"><Zap className="h-6 w-6" /> Săn mã giảm giá</h1>
                <p className="mt-1 text-sm text-white/90">Mã phát theo khung giờ, số lượng có hạn — nhanh tay kẻo hết!</p>
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                : !data || data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                        <p className="text-sm text-gray-500">Hiện chưa có đợt săn mã nào. Quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.map((c) => {
                            const pct = c.claimLimit ? Math.round((c.claimedCount / c.claimLimit) * 100) : 0;
                            const claimedByMe = c.claimed;
                            const canClaim = c.status === 'LIVE' && !claimedByMe && (c.remaining == null || c.remaining > 0);
                            const claiming = claim.isPending && claim.variables === c.id;

                            return (
                                <div key={c.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    <div className="flex items-stretch">
                                        {/* Mã */}
                                        <div className="flex w-28 shrink-0 flex-col items-center justify-center border-r border-dashed border-gray-200 bg-red-50 p-3 text-center">
                                            <span className="font-mono text-sm font-bold text-red-600">{c.code ?? '• • • • •'}</span>
                                            <span className="mt-1 text-[11px] text-gray-500">{c.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm giá'}</span>
                                        </div>
                                        {/* Nội dung */}
                                        <div className="min-w-0 flex-1 p-4">
                                            <p className="text-sm font-semibold text-gray-900">{describe(c)}</p>
                                            {c.minOrder > 0 && <p className="text-xs text-gray-400">Đơn tối thiểu {formatVnd(c.minOrder)}</p>}

                                            {/* Thanh tiến trình số lượng */}
                                            {c.claimLimit != null && (
                                                <div className="mt-2">
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                                        <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${Math.min(100, pct)}%` }} />
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-gray-500">Đã săn {c.claimedCount}/{c.claimLimit} · còn {c.remaining}</p>
                                                </div>
                                            )}

                                            {/* Trạng thái thời gian */}
                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                {c.status === 'UPCOMING' && c.claimStartAt ? (
                                                    <span>Mở sau: <b className="text-orange-600"><Countdown to={c.claimStartAt} onEnd={() => refetch()} /></b></span>
                                                ) : c.status === 'LIVE' && c.claimEndAt ? (
                                                    <span>Kết thúc sau: <b className="text-red-600"><Countdown to={c.claimEndAt} onEnd={() => refetch()} /></b></span>
                                                ) : c.status === 'SOLD_OUT' ? (
                                                    <span className="text-gray-400">Đã hết mã</span>
                                                ) : (
                                                    <span>Đang mở</span>
                                                )}
                                            </div>

                                            {claim.isError && claim.variables === c.id && (
                                                <p className="mt-1 text-xs text-red-500">{getApiErrorMessage(claim.error)}</p>
                                            )}
                                        </div>
                                        {/* Nút */}
                                        <div className="flex w-28 shrink-0 items-center justify-center p-3">
                                            {claimedByMe ? (
                                                <span className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600"><Check className="h-4 w-4" /> Đã lấy</span>
                                            ) : c.status === 'UPCOMING' ? (
                                                <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400">Sắp mở</span>
                                            ) : !canClaim ? (
                                                <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400">Hết mã</span>
                                            ) : (
                                                <button onClick={() => claim.mutate(c.id)} disabled={claiming}
                                                    className="flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                                    {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Lấy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            <p className="mt-6 text-center text-xs text-gray-400">Mã đã săn sẽ nằm trong <a href="/vouchers" className="text-blue-600 hover:underline">Ví mã</a> của bạn.</p>
        </div>
    );
}
