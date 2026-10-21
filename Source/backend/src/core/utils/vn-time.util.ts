/**
 * Ngày theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè). Server/container chạy UTC nên không được dùng
 * setHours / getDate để chia ngày — đơn lúc 0h–7h sáng giờ VN sẽ bị tính sang ngày hôm trước.
 */
export const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Mốc thời gian → 'YYYY-MM-DD' theo giờ VN */
export function vnDayKey(d: Date): string {
    return new Date(d.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' (ngày VN) → mốc 00:00 giờ VN của ngày đó */
export function vnDayStart(day: string): Date {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d) - VN_OFFSET_MS);
}

export function addDays(day: string, n: number): string {
    return vnDayKey(new Date(vnDayStart(day).getTime() + n * DAY_MS));
}

export function daysBetween(from: string, to: string): number {
    return Math.round((vnDayStart(to).getTime() - vnDayStart(from).getTime()) / DAY_MS) + 1;
}

export function vnToday(): string {
    return vnDayKey(new Date());
}
