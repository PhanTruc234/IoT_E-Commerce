import { formatVnd } from '@/shared/lib/format';
import type { ActivePromotion } from '../api/promotions.api';

// Định dạng theo giờ Việt Nam để server (Vercel chạy UTC) và trình duyệt ra cùng một chuỗi
function formatDay(iso: string, withYear: boolean) {
    // Ghép tay "dd/mm(/yyyy)": định dạng vi-VN khi bỏ năm lại dùng dấu gạch (14-10)
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
    }).formatToParts(new Date(iso));
    const get = (type: string) => parts.find((x) => x.type === type)?.value ?? '';
    return withYear ? `${get('day')}/${get('month')}/${get('year')}` : `${get('day')}/${get('month')}`;
}

export function promoDateRange(p: ActivePromotion): string | null {
    if (p.startAt && p.endAt) return `${formatDay(p.startAt, false)} – ${formatDay(p.endAt, true)}`;
    if (p.endAt) return `Đến hết ${formatDay(p.endAt, true)}`;
    return null;
}

export function promoAmount(p: ActivePromotion) {
    return p.discountType === 'PERCENT'
        ? { value: String(p.value), unit: '%' }
        : { value: new Intl.NumberFormat('vi-VN').format(p.value), unit: 'đ' };
}

/** Chữ trên huy hiệu tròn: "-50K", "-1.5TR", "-20%" */
export function promoBadge(p: ActivePromotion) {
    if (p.discountType === 'PERCENT') return `-${p.value}%`;
    if (p.value >= 1_000_000) return `-${Number((p.value / 1_000_000).toFixed(1))}TR`;
    return `-${Math.round(p.value / 1000)}K`;
}

/** Phạm vi áp dụng, dùng cho ô thông tin và dòng phụ dưới số tiền */
export function promoScope(p: ActivePromotion) {
    if (p.scope === 'ALL') return 'Tất cả sản phẩm';
    if (p.scope === 'PRODUCT') return `${p.productIds.length} sản phẩm chọn lọc`;
    const names = p.categories?.map((c) => c.name) ?? [];
    if (names.length === 0) return `${p.categoryIds.length} danh mục chọn lọc`;
    return names.length <= 2 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

/** Dòng chữ dưới số tiền: mô tả admin nhập, không có thì ghi phạm vi (giữ nguyên chữ hoa tên danh mục) */
export function promoSubtitle(p: ActivePromotion) {
    const desc = p.description?.trim();
    if (desc) return desc;
    if (p.scope === 'ALL') return 'Cho tất cả sản phẩm';
    if (p.scope === 'PRODUCT') return `Cho ${p.productIds.length} sản phẩm chọn lọc`;
    return p.categories?.length ? `Cho danh mục ${promoScope(p)}` : `Cho ${p.categoryIds.length} danh mục chọn lọc`;
}

export function promoBadgeScope(p: ActivePromotion) {
    return p.scope === 'ALL' ? 'cho tất cả sản phẩm' : p.scope === 'CATEGORY' ? 'cho danh mục chọn lọc' : 'cho sản phẩm chọn lọc';
}

/** Ô thông tin đầu tiên: "Giảm trực tiếp 50.000₫" hoặc "Giảm 20% · Tối đa 100.000₫" */
export function promoDiscountInfo(p: ActivePromotion) {
    if (p.discountType === 'FIXED') return { label: 'Giảm trực tiếp', value: formatVnd(p.value) };
    return { label: `Giảm ${p.value}%`, value: p.maxDiscount ? `Tối đa ${formatVnd(p.maxDiscount)}` : 'Trên giá bán' };
}

/** Nút "Mua ngay": link admin nhập; không có thì tới trang sản phẩm (lọc sẵn nếu khuyến mãi chỉ cho 1 danh mục) */
export function promoHref(p: ActivePromotion) {
    if (p.linkUrl) return p.linkUrl;
    if (p.scope === 'CATEGORY' && p.categoryIds.length === 1) return `/products?categoryId=${p.categoryIds[0]}`;
    return '/products';
}

/** Ảnh trên R2 thì cho Next tối ưu; URL khác (admin dán link ngoài) hiển thị nguyên bản để không bị lỗi domain */
export function isOptimizableImage(url: string) {
    try {
        const host = new URL(url).hostname;
        return host.endsWith('.r2.dev') || host.endsWith('.r2.cloudflarestorage.com');
    } catch {
        return false;
    }
}
