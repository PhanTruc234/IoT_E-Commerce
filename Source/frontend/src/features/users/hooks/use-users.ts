'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserListParams } from '../api/users.api';
import type { UserRole } from '../types';

export function useUsers(params: UserListParams) {
    return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => usersApi.list(params) });
}

export function useSetUserRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.setRole(id, role),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    });
}

export function useSetUserStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.setStatus(id, isActive),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    });
}
