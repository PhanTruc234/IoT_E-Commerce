'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationInput } from '../api/notifications.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUnreadCount() {
    const status = useAuthStore((s) => s.status);
    return useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: notificationsApi.unreadCount,
        enabled: status === 'authenticated',
        refetchInterval: 30000, // polling 30s
    });
}
export function useNotifications(enabled: boolean) {
    return useQuery({ queryKey: ['notifications', 'list'], queryFn: notificationsApi.list, enabled });
}
export function useNotiActions() {
    const qc = useQueryClient();
    const inv = () => {
        qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
        qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    };
    return {
        markRead: useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: inv }),
        markAll: useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: inv }),
    };
}
// Admin
export function useAdminNotifications() {
    return useQuery({ queryKey: ['admin', 'notifications'], queryFn: notificationsApi.adminList });
}
export function useNotificationMutations() {
    const qc = useQueryClient();
    const inv = () => qc.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    return {
        create: useMutation({ mutationFn: (b: NotificationInput) => notificationsApi.adminCreate(b), onSuccess: inv }),
        remove: useMutation({ mutationFn: (id: string) => notificationsApi.adminRemove(id), onSuccess: inv }),
    };
}