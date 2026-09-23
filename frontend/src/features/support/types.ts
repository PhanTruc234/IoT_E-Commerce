export type TicketType = 'GENERAL' | 'ORDER' | 'RETURN' | 'WARRANTY' | 'COMPLAINT' | 'PAYMENT' | 'SHIPPING' | 'PRIVACY';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportMessage {
    id: string;
    body: string;
    attachments: string[];
    isStaff: boolean;
    createdAt: string;
    sender: { fullName: string } | null;
}
export interface SupportTicketListItem {
    id: string;
    code: string;
    type: TicketType;
    status: TicketStatus;
    subject: string;
    createdAt: string;
    updatedAt: string;
    order: { code: string } | null;
    _count: { messages: number };
}
export interface SupportTicketDetail {
    id: string;
    code: string;
    type: TicketType;
    status: TicketStatus;
    subject: string;
    orderId: string | null;
    order: { id: string; code: string } | null;
    createdAt: string;
    updatedAt: string;
    messages: SupportMessage[];
}
export interface AdminTicketRow extends SupportTicketListItem {
    user: { fullName: string; email: string } | null;
}
export interface AdminTicketDetail extends SupportTicketDetail {
    user: { fullName: string; email: string; phone: string | null } | null;
}
export interface AdminTicketListResponse {
    data: AdminTicketRow[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}
export interface AdminTicketParams {
    page?: number; limit?: number; search?: string; status?: TicketStatus; type?: TicketType;
}