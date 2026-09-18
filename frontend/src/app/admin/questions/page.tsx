'use client';
import { useState } from 'react';
import { MessageCircleQuestion, Search, Send, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Modal } from '@/shared/ui/modal';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAdminQuestions, useAnswerQuestion, useDeleteQuestion } from '@/features/questions/hooks/use-questions';
import type { AdminQuestion } from '@/features/questions/types';

export default function AdminQuestionsPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [answered, setAnswered] = useState('');
    const [answering, setAnswering] = useState<AdminQuestion | null>(null);
    const [deleting, setDeleting] = useState<AdminQuestion | null>(null);

    const { data, isLoading, isError, error, isFetching } = useAdminQuestions({ page, limit: 15, search: search || undefined, answered: answered || undefined });
    const del = useDeleteQuestion();

    return (
        <div>
            <PageHeader title="Hỏi đáp" description="Trả lời câu hỏi của khách về sản phẩm." />

            <div className="mb-4 flex flex-wrap gap-2">
                <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm nội dung…" className="pl-9" />
                </form>
                <Select value={answered} onChange={(e) => { setPage(1); setAnswered(e.target.value); }} className="w-44">
                    <option value="">Tất cả</option>
                    <option value="false">Chưa trả lời</option>
                    <option value="true">Đã trả lời</option>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                    : isError ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                        : (
                            <ul className="divide-y divide-gray-100">
                                {data!.data.length === 0 && (
                                    <li className="px-4 py-12 text-center text-gray-400"><MessageCircleQuestion className="mx-auto mb-2 h-8 w-8 text-gray-300" />Chưa có câu hỏi.</li>
                                )}
                                {data!.data.map((q) => (
                                    <li key={q.id} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">{q.product.name}</span>
                                                    {q.answer ? <Badge color="green">Đã trả lời</Badge> : <Badge color="amber">Chưa trả lời</Badge>}
                                                </div>
                                                <p className="text-sm text-gray-800">{q.content}</p>
                                                <p className="mt-0.5 text-xs text-gray-400">{q.user.fullName} · {new Date(q.createdAt).toLocaleDateString('vi-VN')}</p>
                                                {q.answer && <p className="mt-2 rounded-lg bg-blue-50 p-2 text-sm text-gray-700">{q.answer}</p>}
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <Button size="sm" onClick={() => setAnswering(q)}>{q.answer ? 'Sửa trả lời' : 'Trả lời'}</Button>
                                                <button onClick={() => setDeleting(q)} title="Xoá" className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
            </div>

            {data && data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} câu hỏi</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            {answering && <AnswerModal question={answering} onClose={() => setAnswering(null)} />}

            <ConfirmDialog
                open={deleting !== null}
                title="Xoá câu hỏi"
                message="Xoá câu hỏi này?"
                confirmText="Xoá"
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setDeleting(null); del.reset(); }}
                onConfirm={() => { if (deleting) del.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}
            />
        </div>
    );
}

function AnswerModal({ question, onClose }: { question: AdminQuestion; onClose: () => void }) {
    const [answer, setAnswer] = useState(question.answer ?? '');
    const mutate = useAnswerQuestion();
    return (
        <Modal open onClose={onClose} title="Trả lời câu hỏi"
            footer={<>
                <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                <Button type="button" disabled={!answer.trim() || mutate.isPending}
                    onClick={() => mutate.mutate({ id: question.id, answer: answer.trim() }, { onSuccess: onClose })}>
                    <Send className="h-4 w-4" /> {mutate.isPending ? 'Đang lưu…' : 'Gửi trả lời'}
                </Button>
            </>}>
            <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="text-xs text-gray-400">{question.product.name} · {question.user.fullName}</p>
                    <p className="mt-1 text-gray-800">{question.content}</p>
                </div>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="Nhập câu trả lời…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                {mutate.isError && <p className="text-sm text-red-600">{getApiErrorMessage(mutate.error)}</p>}
            </div>
        </Modal>
    );
}