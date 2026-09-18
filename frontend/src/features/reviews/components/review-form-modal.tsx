'use client';
import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useCreateReview } from '../hooks/use-reviews';
import { StarInput } from './stars';

export function ReviewFormModal({ productId, productName, onClose }: { productId: string; productName: string; onClose: () => void }) {
    const create = useCreateReview(productId);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const submit = () => {
        if (rating < 1) return;
        create.mutate({ rating, comment: comment.trim() || undefined });
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Đánh giá sản phẩm"
            footer={
                create.isSuccess ? (
                    <Button type="button" onClick={onClose}>Đóng</Button>
                ) : (
                    <>
                        <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                        <Button type="button" onClick={submit} disabled={create.isPending}>
                            {create.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
                        </Button>
                    </>
                )
            }
        >
            {create.isSuccess ? (
                <p className="py-4 text-center text-sm text-green-600">Đã gửi! Đánh giá sẽ hiển thị sau khi được duyệt.</p>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">{productName}</p>
                    <StarInput value={rating} onChange={setRating} />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Chia sẻ cảm nhận của bạn…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {create.isError && <p className="text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
                </div>
            )}
        </Modal>
    );
}
