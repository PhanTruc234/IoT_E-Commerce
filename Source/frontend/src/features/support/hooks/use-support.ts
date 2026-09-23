'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type MessageBody, supportApi, type CreateTicketBody } from '../api/support.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AdminTicketParams, TicketStatus } from '../types';

export function useMyTickets() {
    const status = useAuthStore((s) => s.status);
    return useQuery({
        queryKey: ['support', 'tickets'],
        queryFn: supportApi.list, enabled: status === 'authenticated'
    });
}
export function useTicket(id: string) {
    return useQuery({
        queryKey: ['support', 'ticket', id],
        queryFn: () => supportApi.get(id), enabled: !!id
    });
}
export function useCreateTicket() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateTicketBody) => supportApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['support', 'tickets'] }),
    });
}
export function useReplyTicket(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: MessageBody) => supportApi.reply(id, body),
        onSuccess: (data) => { qc.setQueryData(['support', 'ticket', id], data); qc.invalidateQueries({ queryKey: ['support', 'tickets'] }); },
    });
}
export function useCloseTicket(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => supportApi.close(id),
        onSuccess: (data) => {
            qc.setQueryData(['support', 'ticket', id], data);
            qc.invalidateQueries({ queryKey: ['support', 'tickets'] });
        },
    });
}
export function useAdminTickets(params: AdminTicketParams) {
    return useQuery({
        queryKey: ['admin', 'support', params],
        queryFn: () => supportApi.adminList(params)
    });
}
export function useAdminTicket(id: string) {
    return useQuery({
        queryKey: ['admin', 'ticket', id],
        queryFn: () => supportApi.adminGet(id), enabled: !!id
    });
}
export function useAdminReply(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: MessageBody) => supportApi.adminReply(id, body),
        onSuccess: (data) => { qc.setQueryData(['admin', 'ticket', id], data); qc.invalidateQueries({ queryKey: ['admin', 'support'] }); },
    });
}
export function useAdminTicketStatus(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (status: TicketStatus) => supportApi.adminStatus(id, status),
        onSuccess: (data) => {
            qc.setQueryData(['admin', 'ticket', id], data);
            qc.invalidateQueries({ queryKey: ['admin', 'support'] });
        },
    });
}