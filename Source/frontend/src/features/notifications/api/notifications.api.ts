import { apiClient } from '@/shared/lib/api-client';

export type NotiType = 'SYSTEM' | 'PROMOTION' | 'COUPON' | 'ORDER';
export type NotiAudience = 'ALL' | 'USER';

export interface Notification {
    id: string; title: string; body: string; type: NotiType;
    linkUrl: string | null; createdAt: string; read: boolean;
}
export interface AdminNotification {
    id: string; title: string; body: string; type: NotiType;
    audience: NotiAudience; userId: string | null; linkUrl: string | null; createdAt: string;
}
export interface NotificationInput {
    title: string; body: string; type: NotiType; audience: NotiAudience; userId?: string; linkUrl?: string;
}

export const notificationsApi = {
    list: () => apiClient.get<Notification[]>('/notifications').then((r) => r.data),
    unreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),
    markRead: (id: string) => apiClient.post(`/notifications/${id}/read`).then((r) => r.data),
    markAllRead: () => apiClient.post('/notifications/read-all').then((r) => r.data),
    adminList: () => apiClient.get<AdminNotification[]>('/notifications/admin').then((r) => r.data),
    adminCreate: (b: NotificationInput) => apiClient.post('/notifications/admin', b).then((r) => r.data),
    adminRemove: (id: string) => apiClient.delete(`/notifications/admin/${id}`).then((r) => r.data),
};