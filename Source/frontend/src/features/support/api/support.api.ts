import { apiClient } from '@/shared/lib/api-client';
import type {
    AdminTicketDetail, AdminTicketListResponse, AdminTicketParams,
    SupportTicketDetail, SupportTicketListItem, TicketStatus, TicketType,
} from '../types';

export interface CreateTicketBody { type: TicketType; subject: string; message: string; orderId?: string; attachments?: string[] }
export interface MessageBody { message: string; attachments?: string[] }
export interface UploadedFile { url: string; key: string }
export const supportApi = {
    uploadAttachments: async (files: File[]): Promise<UploadedFile[]> => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        const { data } = await apiClient.post<UploadedFile[]>('/support/tickets/uploads', form);
        return data;
    },
    create: (body: CreateTicketBody) => apiClient.post<SupportTicketDetail>('/support/tickets', body).then((r) => r.data),
    list: () => apiClient.get<SupportTicketListItem[]>('/support/tickets').then((r) => r.data),
    get: (id: string) => apiClient.get<SupportTicketDetail>(`/support/tickets/${id}`).then((r) => r.data),
    reply: (id: string, body: MessageBody) => apiClient.post<SupportTicketDetail>(`/support/tickets/${id}/messages`, body).then((r) => r.data),
    close: (id: string) => apiClient.patch<SupportTicketDetail>(`/support/tickets/${id}/close`).then((r) => r.data),
    adminList: (params: AdminTicketParams) => apiClient.get<AdminTicketListResponse>('/admin/support/tickets', { params }).then((r) => r.data),
    adminGet: (id: string) => apiClient.get<AdminTicketDetail>(`/admin/support/tickets/${id}`).then((r) => r.data),
    adminReply: (id: string, body: MessageBody) => apiClient.post<AdminTicketDetail>(`/admin/support/tickets/${id}/messages`, body).then((r) => r.data),
    adminStatus: (id: string, status: TicketStatus) => apiClient.patch<AdminTicketDetail>(`/admin/support/tickets/${id}/status`, { status }).then((r) => r.data),
};