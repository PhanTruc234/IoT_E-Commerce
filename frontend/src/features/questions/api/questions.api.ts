import { apiClient } from '@/shared/lib/api-client';
import type { AdminQuestionList, PublicQuestion } from '../types';

export interface AdminQuestionParams { page?: number; limit?: number; search?: string; answered?: string }

export const questionsApi = {
    listPublic: (productId: string) => apiClient.get<PublicQuestion[]>(`/products/${productId}/questions`).then((r) => r.data),
    ask: (productId: string, content: string) => apiClient.post(`/products/${productId}/questions`, { content }).then((r) => r.data),
    adminList: (params: AdminQuestionParams) => apiClient.get<AdminQuestionList>('/admin/questions', { params }).then((r) => r.data),
    answer: (id: string, answer: string) => apiClient.patch(`/admin/questions/${id}/answer`, { answer }).then((r) => r.data),
    remove: (id: string) => apiClient.delete<{ message: string }>(`/admin/questions/${id}`).then((r) => r.data),
};