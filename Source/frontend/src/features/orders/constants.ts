import type { OrderStatus, PaymentStatus, PaymentTxnStatus } from './types';

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: 'blue' | 'indigo' | 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'blue' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'indigo' },
    SHIPPING: { label: 'Đang giao', color: 'amber' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    CANCELLED: { label: 'Đã huỷ', color: 'red' },
};
export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; color: 'gray' | 'amber' | 'green' | 'red' }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'gray' },
    PENDING: { label: 'Chờ thanh toán', color: 'amber' },
    PAID: { label: 'Đã thanh toán', color: 'green' },
    FAILED: { label: 'Thất bại', color: 'red' },
};
export const PAYMENT_TXN_STATUS: Record<PaymentTxnStatus, { label: string; color: 'gray' | 'amber' | 'green' | 'red' }> = {
    PENDING: { label: 'Đang chờ', color: 'amber' },
    SUCCESS: { label: 'Thành công', color: 'green' },
    FAILED: { label: 'Thất bại', color: 'red' },
    EXPIRED: { label: 'Hết hạn', color: 'gray' },
};
/** Nhãn trạng thái vận đơn GHN (khớp bảng mã trạng thái của GHN) */
export const GHN_STATUS: Record<string, { label: string; tone: 'gray' | 'blue' | 'amber' | 'green' | 'red' }> = {
    ready_to_pick: { label: 'Chờ lấy hàng', tone: 'gray' },
    picking: { label: 'Shipper đang đến lấy hàng', tone: 'blue' },
    money_collect_picking: { label: 'Đang thu tiền người gửi', tone: 'blue' },
    picked: { label: 'Đã lấy hàng', tone: 'blue' },
    storing: { label: 'Hàng đang ở kho GHN', tone: 'blue' },
    sorting: { label: 'Đang phân loại hàng', tone: 'blue' },
    transporting: { label: 'Đang luân chuyển hàng', tone: 'blue' },
    delivering: { label: 'Đang giao hàng', tone: 'amber' },
    money_collect_delivering: { label: 'Đang thu tiền người nhận', tone: 'amber' },
    delivered: { label: 'Giao hàng thành công', tone: 'green' },
    delivery_fail: { label: 'Giao hàng thất bại', tone: 'red' },
    waiting_to_return: { label: 'Chờ trả hàng về shop', tone: 'red' },
    return: { label: 'Đã yêu cầu trả hàng', tone: 'red' },
    return_transporting: { label: 'Đang luân chuyển hàng trả', tone: 'red' },
    return_sorting: { label: 'Đang phân loại hàng trả', tone: 'red' },
    returning: { label: 'Đang trả hàng về shop', tone: 'red' },
    return_fail: { label: 'Trả hàng thất bại', tone: 'red' },
    returned: { label: 'Đã trả hàng về shop', tone: 'red' },
    cancel: { label: 'Đã huỷ vận đơn', tone: 'gray' },
    exception: { label: 'Đơn gặp sự cố', tone: 'red' },
    lost: { label: 'Hàng bị thất lạc', tone: 'red' },
    damage: { label: 'Hàng bị hư hỏng', tone: 'red' },
    scrap: { label: 'Hàng đã bị tiêu huỷ', tone: 'red' },
};
export const ghnStatus = (s: string | null | undefined) => (s && GHN_STATUS[s]) || { label: s ?? 'Chưa có', tone: 'gray' as const };

export const SIMULATE_STATUSES = ['picking', 'picked', 'transporting', 'delivering', 'delivery_fail', 'delivered', 'returned'];

export const NEXT_ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string }[]> = {
    PENDING: [{ to: 'CONFIRMED', label: 'Xác nhận đơn' }, { to: 'CANCELLED', label: 'Huỷ đơn' }],
    CONFIRMED: [{ to: 'SHIPPING', label: 'Giao hàng' }, { to: 'CANCELLED', label: 'Huỷ đơn' }],
    SHIPPING: [{ to: 'COMPLETED', label: 'Hoàn thành' }],
    COMPLETED: [],
    CANCELLED: [],
};