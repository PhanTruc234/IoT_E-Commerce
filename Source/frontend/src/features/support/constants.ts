import {
    HelpCircle, LifeBuoy, PackageX, ShieldCheck, AlertTriangle,
    CreditCard, Truck, Lock, type LucideIcon,
} from 'lucide-react';
import type { TicketType, TicketStatus } from './types';

type BadgeColor = 'gray' | 'blue' | 'amber' | 'red' | 'green' | 'indigo';

export const TICKET_TYPE: Record<TicketType, { label: string; icon: LucideIcon; color: BadgeColor; hint: string }> = {
    GENERAL: { label: 'Hỏi chung', icon: HelpCircle, color: 'gray', hint: 'Mô tả câu hỏi hoặc vấn đề bạn cần hỗ trợ…' },
    ORDER: { label: 'Đơn hàng', icon: LifeBuoy, color: 'blue', hint: 'Cho chúng tôi biết vấn đề bạn gặp với đơn hàng…' },
    RETURN: { label: 'Đổi / Trả hàng', icon: PackageX, color: 'amber', hint: 'Nêu lý do đổi/trả và tình trạng sản phẩm, kèm ảnh nếu có…' },
    WARRANTY: { label: 'Bảo hành', icon: ShieldCheck, color: 'indigo', hint: 'Mô tả lỗi sản phẩm, số serial (nếu có) và đính kèm ảnh minh hoạ…' },
    COMPLAINT: { label: 'Khiếu nại', icon: AlertTriangle, color: 'red', hint: 'Mô tả chi tiết vấn đề bạn chưa hài lòng…' },
    PAYMENT: { label: 'Thanh toán', icon: CreditCard, color: 'green', hint: 'Mô tả vấn đề thanh toán (mã giao dịch, thời điểm…)…' },
    SHIPPING: { label: 'Vận chuyển', icon: Truck, color: 'blue', hint: 'Mô tả vấn đề vận chuyển (giao chậm, thiếu hàng…)…' },
    PRIVACY: { label: 'Dữ liệu cá nhân', icon: Lock, color: 'gray', hint: 'Yêu cầu về dữ liệu cá nhân của bạn…' },
};

export const TICKET_STATUS: Record<TicketStatus, { label: string; color: BadgeColor }> = {
    OPEN: { label: 'Mới', color: 'blue' },
    IN_PROGRESS: { label: 'Đang xử lý', color: 'amber' },
    RESOLVED: { label: 'Đã giải quyết', color: 'green' },
    CLOSED: { label: 'Đã đóng', color: 'gray' },
};

export const GENERAL_TICKET_TYPES: TicketType[] = ['GENERAL', 'ORDER', 'RETURN', 'WARRANTY', 'COMPLAINT', 'PAYMENT', 'SHIPPING', 'PRIVACY'];
export const ORDER_LINKED_TYPES: TicketType[] = ['ORDER', 'RETURN', 'WARRANTY', 'COMPLAINT', 'PAYMENT', 'SHIPPING'];