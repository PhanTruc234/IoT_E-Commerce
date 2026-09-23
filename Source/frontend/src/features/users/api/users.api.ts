import { apiClient } from '@/shared/lib/api-client';
import type { AdminUser, AdminUserList, UserRole } from '../types';

export interface CustomerOption {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
}

export const usersApi = {
    searchCustomers: (search: string) =>
        apiClient.get<CustomerOption[]>('/admin/users/customers', { params: { search } }).then((r) => r.data),
    list: (params: UserListParams) =>
        apiClient.get<AdminUserList>('/admin/users', { params }).then((r) => r.data),
    setRole: (id: string, role: UserRole) =>
        apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role }).then((r) => r.data),
    setStatus: (id: string, isActive: boolean) =>
        apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
};
