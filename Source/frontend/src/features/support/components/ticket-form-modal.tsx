'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useMyOrders } from '@/features/orders/hooks/use-orders';
import { useCreateTicket } from '../hooks/use-support';
import { supportApi } from '../api/support.api';
import { TICKET_TYPE, GENERAL_TICKET_TYPES, ORDER_LINKED_TYPES } from '../constants';
import type { TicketType } from '../types';

export function TicketFormModal({ onClose, presetType, lockType = false, orderId: fixedOrderId, orderCode }: {
    onClose: () => void; presetType?: TicketType; lockType?: boolean; orderId?: string; orderCode?: string;
}) {
    const router = useRouter();
    const create = useCreateTicket();
    const { data: orders } = useMyOrders();
    const initType = presetType ?? 'GENERAL';
    const [type, setType] = useState<TicketType>(initType);
    const [orderId, setOrderId] = useState(fixedOrderId ?? '');
    const [subject, setSubject] = useState(orderCode ? `${TICKET_TYPE[initType].label} - đơn ${orderCode}` : '');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const meta = TICKET_TYPE[type];
    const showOrder = ORDER_LINKED_TYPES.includes(type);
    const canSubmit = subject.trim().length >= 3 && message.trim().length >= 5;
    const busy = create.isPending || uploading;

    const pick = (list: FileList | null) => {
        if (!list) return;
        setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.type.startsWith('image/'))].slice(0, 6));
    };

    const submit = async () => {
        if (!canSubmit || busy) return;
        setError(null);
        try {
            let attachments: string[] = [];
            if (files.length) { setUploading(true); attachments = (await supportApi.uploadAttachments(files)).map((u) => u.url); }
            create.mutate(
                {
                    type,
                    subject: subject.trim(),
                    message: message.trim(),
                    orderId: showOrder && orderId ? orderId : undefined,
                    attachments
                },
                { onSuccess: (t) => { onClose(); router.push(`/support?t=${t.id}`); } },
            );
        } catch (e) { setError(getApiErrorMessage(e)); } finally { setUploading(false); }
    };

    return (
        <Modal open onClose={onClose} title="Tạo yêu cầu hỗ trợ"
            footer={<>
                <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                <Button type="button" onClick={submit} disabled={busy || !canSubmit}>{busy ? 'Đang gửi…' : 'Gửi yêu cầu'}</Button>
            </>}>
            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại yêu cầu</label>
                    {lockType ? (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"><meta.icon className="h-4 w-4 text-blue-600" /> {meta.label}</div>
                    ) : (
                        <Select value={type} onChange={(e) => setType(e.target.value as TicketType)}>
                            {GENERAL_TICKET_TYPES.map((t) => <option key={t} value={t}>{TICKET_TYPE[t].label}</option>)}
                        </Select>
                    )}
                </div>

                {showOrder && (
                    lockType && fixedOrderId ? (
                        <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">Gắn với đơn hàng <b>{orderCode}</b></div>
                    ) : (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Đơn hàng liên quan <span className="font-normal text-gray-400">(không bắt buộc)</span></label>
                            <Select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                                <option value="">— Không chọn đơn —</option>
                                {orders?.map((o) => <option key={o.id} value={o.id}>Đơn {o.code} · {new Date(o.createdAt).toLocaleDateString('vi-VN')} · {formatVnd(o.total)}</option>)}
                            </Select>
                        </div>
                    )
                )}

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Tóm tắt ngắn gọn vấn đề" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Nội dung</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={meta.hint}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Ảnh đính kèm <span className="font-normal text-gray-400">(không bắt buộc)</span></label>
                    <div className="flex flex-wrap items-center gap-2">
                        {files.map((f, i) => (
                            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                                <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="absolute right-0 top-0 cursor-pointer rounded-bl bg-black/50 p-0.5 text-white"><X className="h-3 w-3" /></button>
                            </div>
                        ))}
                        {files.length < 6 && (
                            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500">
                                <ImagePlus className="h-5 w-5" />
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
                    </div>
                </div>

                {(error || create.isError) && <p className="text-sm text-red-600">{error ?? getApiErrorMessage(create.error)}</p>}
            </div>
        </Modal>
    );
}