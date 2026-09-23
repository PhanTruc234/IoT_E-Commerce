'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProductQuestions, useAskQuestion } from '../hooks/use-questions';

export function ProductQuestions({ productId }: { productId: string }) {
    const authStatus = useAuthStore((s) => s.status);
    const { data, isLoading } = useProductQuestions(productId);
    const ask = useAskQuestion(productId);
    const [content, setContent] = useState('');

    const submit = () => {
        if (content.trim().length < 5) return;
        ask.mutate(content.trim(), { onSuccess: () => setContent('') });
    };

    return (
        <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <MessageCircleQuestion className="h-5 w-5 text-blue-600" /> Hỏi &amp; Đáp
            </h2>

            {/* Form đặt câu hỏi */}
            {authStatus === 'authenticated' ? (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        placeholder="Đặt câu hỏi về sản phẩm này…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex items-center justify-between">
                        {ask.isSuccess ? (
                            <span className="text-sm text-green-600">Đã gửi! Câu hỏi sẽ hiển thị sau khi được trả lời.</span>
                        ) : ask.isError ? (
                            <span className="text-sm text-red-600">{getApiErrorMessage(ask.error)}</span>
                        ) : <span className="text-xs text-gray-400">Tối thiểu 5 ký tự.</span>}
                        <button type="button" onClick={submit} disabled={ask.isPending || content.trim().length < 5}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            <Send className="h-4 w-4" /> {ask.isPending ? 'Đang gửi…' : 'Gửi câu hỏi'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <Link href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập</Link> để đặt câu hỏi về sản phẩm.
                </div>
            )}

            {/* Danh sách hỏi đáp đã trả lời */}
            {isLoading ? (
                <p className="text-sm text-gray-400">Đang tải…</p>
            ) : (data?.length ?? 0) === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    Chưa có câu hỏi nào được trả lời. Hãy là người đầu tiên đặt câu hỏi!
                </p>
            ) : (
                <ul className="space-y-4">
                    {data!.map((q) => (
                        <li key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start gap-2">
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">H</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-800">{q.content}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">{q.askerName} · {new Date(q.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            {q.answer && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">A</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-800">{q.answer}</p>
                                        <p className="mt-0.5 text-xs text-blue-600">Quản trị viên{q.answeredAt ? ` · ${new Date(q.answeredAt).toLocaleDateString('vi-VN')}` : ''}</p>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}