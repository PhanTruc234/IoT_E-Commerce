'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import type { OverviewRange, Pair } from '../api/overview.api';

// ---------- Ngày theo giờ Việt Nam (khớp backend) ----------
export function vnToday(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}
export function shiftDay(day: string, n: number): string {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function fmtDay(day: string, withYear = false) {
    const [y, m, d] = day.split('-');
    return withYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

type PresetKey = 'today' | '7d' | '30d' | 'month' | 'lastMonth' | 'year';
export const PRESETS: { key: PresetKey; label: string; range: () => OverviewRange }[] = [
    { key: 'today', label: 'Hôm nay', range: () => ({ from: vnToday(), to: vnToday() }) },
    { key: '7d', label: '7 ngày', range: () => ({ from: shiftDay(vnToday(), -6), to: vnToday() }) },
    { key: '30d', label: '30 ngày', range: () => ({ from: shiftDay(vnToday(), -29), to: vnToday() }) },
    { key: 'month', label: 'Tháng này', range: () => ({ from: `${vnToday().slice(0, 7)}-01`, to: vnToday() }) },
    {
        key: 'lastMonth', label: 'Tháng trước', range: () => {
            const end = shiftDay(`${vnToday().slice(0, 7)}-01`, -1);
            return { from: `${end.slice(0, 7)}-01`, to: end };
        },
    },
    { key: 'year', label: 'Năm nay', range: () => ({ from: `${vnToday().slice(0, 4)}-01-01`, to: vnToday() }) },
];

/** Bộ lọc kỳ: các mốc nhanh + khoảng tuỳ chọn, nằm một hàng trên cùng */
export function PeriodBar({ value, prev, onChange, loading }: {
    value: OverviewRange;
    prev?: OverviewRange;
    onChange: (r: OverviewRange) => void;
    loading?: boolean;
}) {
    const active = PRESETS.find((p) => {
        const r = p.range();
        return r.from === value.from && r.to === value.to;
    })?.key;
    const [custom, setCustom] = useState(!active);
    // Giữ khoảng ≤ 366 ngày (giới hạn của API): đổi một đầu thì kéo đầu kia theo
    const MAX_SPAN = 365;
    const setFrom = (from: string) => onChange({ from, to: value.to < from || value.to > shiftDay(from, MAX_SPAN) ? [shiftDay(from, MAX_SPAN), vnToday()].sort()[0] : value.to });
    const setTo = (to: string) => onChange({ to, from: value.from > to || value.from < shiftDay(to, -MAX_SPAN) ? shiftDay(to, -MAX_SPAN) : value.from });
    const input = 'rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500';
    return (
        <div className="sticky top-0 z-20 -mx-1 mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white/95 px-3 py-2.5 backdrop-blur">
            {PRESETS.map((p) => (
                <button key={p.key} type="button" aria-pressed={active === p.key && !custom}
                    onClick={() => { setCustom(false); onChange(p.range()); }}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm ${active === p.key && !custom ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {p.label}
                </button>
            ))}
            <button type="button" aria-pressed={custom} onClick={() => setCustom(true)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm ${custom ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Tuỳ chọn
            </button>
            {custom && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <input type="date" className={input} value={value.from} max={vnToday()} onChange={(e) => e.target.value && setFrom(e.target.value)} aria-label="Từ ngày" />
                    –
                    <input type="date" className={input} value={value.to} max={vnToday()} onChange={(e) => e.target.value && setTo(e.target.value)} aria-label="Đến ngày" />
                </span>
            )}
            <span className="ml-auto text-xs text-gray-400">
                {loading ? 'Đang tải…' : prev && <>% so với kỳ trước ({fmtDay(prev.from)} – {fmtDay(prev.to, true)}) · giờ Việt Nam</>}
            </span>
        </div>
    );
}

/**
 * % thay đổi so với kỳ trước. `rate` = chỉ số dạng tỉ lệ → hiện chênh lệch theo điểm %.
 * `lowerIsBetter` (VD tỉ lệ huỷ) đảo màu tốt/xấu. Luôn có mũi tên + chữ, không chỉ dựa vào màu.
 */
export function Delta({ pair, rate, lowerIsBetter }: { pair: Pair; rate?: boolean; lowerIsBetter?: boolean }) {
    const { cur, prev } = pair;
    const diff = cur - prev;
    if (!rate && prev === 0) {
        return <span className="text-xs text-gray-400" title="So với kỳ trước">{cur === 0 ? 'Không đổi' : 'Kỳ trước: 0'}</span>;
    }
    const change = rate ? diff : (diff / prev) * 100;
    const flat = Math.abs(change) < 0.05;
    const good = lowerIsBetter ? change < 0 : change > 0;
    const tone = flat ? 'text-gray-500' : good ? 'text-green-700' : 'text-red-600';
    const Icon = flat ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
    const text = `${change > 0 ? '+' : ''}${change.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${rate ? ' điểm %' : '%'}`;
    return (
        <span className={`inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-medium ${tone}`} title={`So với kỳ trước: ${rate ? `${prev.toLocaleString('vi-VN')}%` : prev.toLocaleString('vi-VN')}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden /> {flat ? 'Không đổi' : text}
            <span className="sr-only"> so với kỳ trước</span>
        </span>
    );
}

export function Section({ title, icon: Icon, href, linkLabel = 'Xem chi tiết', children, className = '' }: {
    title: string;
    icon: React.ElementType;
    href: string;
    linkLabel?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`flex flex-col rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800"><Icon className="h-4 w-4 text-blue-600" aria-hidden /> {title}</h2>
                <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-600 hover:underline">
                    {linkLabel} <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
            </div>
            <div className="flex-1">{children}</div>
        </section>
    );
}

export function Stat({ label, value, delta, hint, big }: { label: string; value: string; delta?: React.ReactNode; hint?: React.ReactNode; big?: boolean }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`font-bold tabular-nums text-gray-900 ${big ? 'text-2xl' : 'text-lg'}`}>{value}</p>
            {delta && <div className="mt-0.5">{delta}</div>}
            {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}

/** Ô "việc cần làm": số lớn, bấm vào đi tới trang xử lý */
export function TodoTile({ label, count, href, tone }: { label: string; count: number; href: string; tone?: 'warn' }) {
    const hot = count > 0 && tone === 'warn';
    return (
        <Link href={href} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 hover:border-blue-300 ${hot ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
            <span className="text-sm text-gray-700">{label}</span>
            <span className={`text-lg font-bold tabular-nums ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span>
        </Link>
    );
}

/** Thanh ngang 1 màu (độ lớn) — nhãn & số luôn hiện bằng chữ, không dựa vào màu */
export function BarList({ rows, empty = 'Chưa có dữ liệu trong kỳ' }: { rows: { key: string; label: React.ReactNode; value: number; display: string }[]; empty?: string }) {
    if (!rows.length || rows.every((r) => r.value === 0)) return <p className="py-4 text-center text-xs text-gray-400">{empty}</p>;
    const max = Math.max(...rows.map((r) => r.value), 1);
    return (
        <ul className="space-y-2">
            {rows.map((r) => (
                <li key={r.key}>
                    <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate text-gray-700">{r.label}</span>
                        <span className="shrink-0 tabular-nums text-gray-600">{r.display}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-r-[4px] rounded-l-full bg-blue-500" style={{ width: `${Math.max(1, (r.value / max) * 100)}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Doanh thu thuần theo ngày: cột 1 màu, rê chuột hiện số của ngày, kèm bảng số liệu cho người đọc màn hình */
export function DailyChart({ data }: { data: { date: string; net: number; orders: number }[] }) {
    const [hover, setHover] = useState<number | null>(null);
    const W = 720;
    const H = 180;
    const top = 12;
    const bottom = 22;
    const max = Math.max(1, ...data.map((d) => d.net));
    const slot = W / Math.max(1, data.length);
    const bw = Math.max(2, Math.min(28, slot - 2));
    const every = Math.ceil(data.length / 10);
    const h = hover != null ? data[hover] : null;
    return (
        <div>
            <div className="relative">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Doanh thu thuần theo ngày" onMouseLeave={() => setHover(null)}>
                    <line x1={0} x2={W} y1={H - bottom} y2={H - bottom} stroke="#e5e7eb" />
                    <line x1={0} x2={W} y1={top} y2={top} stroke="#f3f4f6" strokeDasharray="3 3" />
                    <text x={2} y={top - 3} fontSize="9" fill="#9ca3af">{formatVnd(max)}</text>
                    {data.map((d, i) => {
                        const bh = (d.net / max) * (H - top - bottom);
                        const x = i * slot + (slot - bw) / 2;
                        return (
                            <g key={d.date} onMouseEnter={() => setHover(i)}>
                                {/* vùng bắt chuột rộng hơn cột */}
                                <rect x={i * slot} y={0} width={slot} height={H - bottom} fill="transparent" />
                                {bh > 0 && (
                                    <path
                                        d={`M${x},${H - bottom} v${-(bh - Math.min(4, bh))} q0,${-Math.min(4, bh)} ${Math.min(4, bw / 2)},${-Math.min(4, bh)} h${bw - 2 * Math.min(4, bw / 2)} q${Math.min(4, bw / 2)},0 ${Math.min(4, bw / 2)},${Math.min(4, bh)} v${bh - Math.min(4, bh)} z`}
                                        fill={hover === i ? '#1d4ed8' : '#3b82f6'}
                                    />
                                )}
                                {(i % every === 0 || i === data.length - 1) && (
                                    <text x={i * slot + slot / 2} y={H - 7} fontSize="9" textAnchor="middle" fill="#9ca3af">{fmtDay(d.date)}</text>
                                )}
                            </g>
                        );
                    })}
                </svg>
                {h && hover != null && (
                    <div className="pointer-events-none absolute top-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow"
                        style={{ left: `${Math.min(80, Math.max(0, ((hover + 0.5) / data.length) * 100 - 10))}%` }}>
                        <p className="font-medium text-gray-800">{fmtDay(h.date, true)}</p>
                        <p className="tabular-nums text-gray-600">{formatVnd(h.net)} · {h.orders} đơn</p>
                    </div>
                )}
            </div>
            <details className="mt-1 text-xs text-gray-500">
                <summary className="cursor-pointer select-none">Xem bảng số liệu</summary>
                <div className="mt-2 max-h-48 overflow-y-auto">
                    <table className="w-full tabular-nums">
                        <thead><tr className="text-left text-gray-400"><th className="py-1">Ngày</th><th className="text-right">Doanh thu thuần</th><th className="text-right">Đơn</th></tr></thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.date} className="border-t border-gray-50"><td className="py-1">{fmtDay(d.date, true)}</td><td className="text-right">{formatVnd(d.net)}</td><td className="text-right">{d.orders}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}
