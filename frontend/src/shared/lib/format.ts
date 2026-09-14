export function formatVnd(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}