'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsApi, type AdminQuestionParams } from '../api/questions.api';

export function useProductQuestions(productId: string) {
    return useQuery({ queryKey: ['shop', 'product-questions', productId], queryFn: () => questionsApi.listPublic(productId), enabled: !!productId });
}
export function useAskQuestion(productId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => questionsApi.ask(productId, content),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', 'product-questions', productId] }),
    });
}
export function useAdminQuestions(params: AdminQuestionParams) {
    return useQuery({ queryKey: ['admin', 'questions', params], queryFn: () => questionsApi.adminList(params) });
}
export function useAnswerQuestion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, answer }: { id: string; answer: string }) => questionsApi.answer(id, answer),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'questions'] }); qc.invalidateQueries({ queryKey: ['shop', 'product-questions'] }); },
    });
}
export function useDeleteQuestion() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => questionsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'questions'] }); qc.invalidateQueries({ queryKey: ['shop', 'product-questions'] }); } });
}