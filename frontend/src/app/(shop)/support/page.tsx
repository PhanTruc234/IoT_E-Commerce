'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { LifeBuoy, Plus, ArrowLeft, ChevronDown, Package } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Badge } from '@/shared/ui/badge';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useMyTickets, useTicket, useReplyTicket, useCloseTicket } from '@/features/support/hooks/use-support';
import { useOrder } from '@/features/orders/hooks/use-orders';
import { MessageList } from '@/features/support/components/message-list';
import { MessageComposer } from '@/features/support/components/message-composer';
import { TicketFormModal } from '@/features/support/components/ticket-form-modal';
import { TICKET_TYPE, TICKET_STATUS } from '@/features/support/constants';
import { SUPPORT_FAQ } from '@/features/support/faq';
import type { SupportTicketListItem } from '@/features/support/types';

type Filter = 'ALL' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';
const matchFilter = (s: SupportTicketListItem['status'], f: Filter) =>
    f === 'ALL' ? true : f === 'ACTIVE' ? (s === 'OPEN' || s === 'IN_PROGRESS') : s === f;

function SupportView() {
    const sp = useSearchParams();
    const authStatus = useAuthStore((s) => s.status);
    const { data: tickets, isLoading } = useMyTickets();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>('ALL');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const t = sp.get('t');
        if (t) setSelectedId(t);
    }, [sp]);

    const counts = useMemo(() => ({
        ALL: tickets?.length ?? 0,
        ACTIVE: tickets?.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length ?? 0,
        RESOLVED: tickets?.filter((t) => t.status === 'RESOLVED').length ?? 0,
        CLOSED: tickets?.filter((t) => t.status === 'CLOSED').length ?? 0,
    }), [tickets]);

    const shown = (tickets ?? []).filter((t) => matchFilter(t.status, filter));

    if (authStatus !== 'authenticated') {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <LifeBuoy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Vui lòng <Link href="/login" className="text-blue-600 hover:underline">đăng nhập</Link> để tạo và xem yêu cầu hỗ trợ.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="grid gap-4 lg:grid-cols-[340px_1fr_300px]">
                <aside className={`${selectedId ? 'hidden lg:block' : 'block'}`}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Yêu cầu hỗ trợ</h1>
                            <p className="text-xs text-gray-400">Theo dõi & quản lý các yêu cầu của bạn.</p>
                        </div>
                        <button onClick={() => setCreating(true)} className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Tạo</button>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1">
                        {([['ALL', 'Tất cả'], ['ACTIVE', 'Đang xử lý'], ['RESOLVED', 'Đã giải quyết'], ['CLOSED', 'Đã đóng']] as [Filter, string][]).map(([k, label]) => (
                            <button key={k} onClick={() => setFilter(k)}
                                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${filter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {label} ({counts[k]})
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <p className="py-6 text-center text-sm text-gray-400">Đang tải…</p>
                    ) : shown.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">Không có yêu cầu.</div>
                    ) : (
                        <ul className="space-y-2">
                            {shown.map((t) => {
                                const meta = TICKET_TYPE[t.type];
                                const on = selectedId === t.id;
                                return (
                                    <li key={t.id}>
                                        <button onClick={() => setSelectedId(t.id)}
                                            className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition ${on ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-200' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500"><meta.icon className="h-5 w-5" /></span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-2">
                                                    <span className="truncate text-xs font-semibold text-gray-500">{t.code}</span>
                                                    <Badge color={TICKET_STATUS[t.status].color}>{TICKET_STATUS[t.status].label}</Badge>
                                                </span>
                                                <span className="mt-0.5 block truncate text-sm font-medium text-gray-800">{t.subject}</span>
                                                <span className="mt-0.5 block text-xs text-gray-400">{t.order ? `Đơn ${t.order.code} · ` : ''}{new Date(t.updatedAt).toLocaleDateString('vi-VN')}</span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="mt-6">
                        <h2 className="mb-2 text-sm font-bold text-gray-900">Câu hỏi thường gặp</h2>
                        <FaqAccordion />
                    </div>
                </aside>


                {selectedId ? (
                    <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
                ) : (
                    <div className="hidden rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400 lg:col-span-2 lg:flex lg:items-center lg:justify-center">
                        Chọn một yêu cầu để xem hội thoại.
                    </div>
                )}
            </div>

            {creating && <TicketFormModal onClose={() => setCreating(false)} />}
        </div>
    );
}

function TicketDetail({ id, onBack }: { id: string; onBack: () => void }) {
    const { data: ticket, isLoading, isError, error } = useTicket(id);
    const reply = useReplyTicket(id);
    const close = useCloseTicket(id);
    const [closing, setClosing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const relatedOrder = useOrder(ticket?.order?.id ?? '');

    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [ticket?.messages.length]);

    if (isLoading) return <div className="lg:col-span-2"><p className="py-16 text-center text-sm text-gray-400">Đang tải…</p></div>;
    if (isError || !ticket) return <div className="lg:col-span-2"><p className="py-16 text-center text-sm text-red-600">{getApiErrorMessage(error)}</p></div>;

    const meta = TICKET_TYPE[ticket.type];
    const closed = ticket.status === 'CLOSED';
    const firstItem = relatedOrder.data?.items[0];

    return (
        <>
            <section className="flex min-h-[70vh] flex-col rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-4">
                    <button onClick={onBack} className="inline-flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-blue-600 lg:hidden"><ArrowLeft className="h-4 w-4" /> Danh sách</button>
                    <button onClick={onBack} className="hidden cursor-pointer items-center gap-1 text-sm text-gray-400 hover:text-blue-600 lg:inline-flex"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách</button>
                    <Badge color={TICKET_STATUS[ticket.status].color}>{TICKET_STATUS[ticket.status].label}</Badge>
                </div>
                <div className="border-b border-gray-100 p-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><meta.icon className="h-5 w-5 text-blue-600" /> Yêu cầu #{ticket.code}</h2>
                    <p className="mt-0.5 text-sm text-gray-600">{ticket.subject}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-400">
                        <span>Tạo lúc: {new Date(ticket.createdAt).toLocaleString('vi-VN')}</span>
                        {ticket.order && <span>Đơn hàng: <Link href={`/orders/${ticket.order.id}`} className="text-blue-600 hover:underline">{ticket.order.code}</Link></span>}
                        <span>Loại: {meta.label}</span>
                    </p>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                    <MessageList messages={ticket.messages} perspective="customer" />
                </div>
                <div className="border-t border-gray-100 p-4">
                    {closed ? <p className="text-center text-sm text-gray-400">Yêu cầu đã đóng.</p>
                        : <MessageComposer sending={reply.isPending} onSend={(message, attachments) => reply.mutate({ message, attachments })} />}
                </div>
            </section>
            <aside className={`space-y-4 ${selectedIdHidden()}`}>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
                    <p className="mb-3 font-semibold text-gray-900">Thông tin yêu cầu</p>
                    <dl className="space-y-2">
                        <Row label="Mã yêu cầu" value={ticket.code} />
                        <div className="flex items-center justify-between"><dt className="text-gray-500">Trạng thái</dt><dd><Badge color={TICKET_STATUS[ticket.status].color}>{TICKET_STATUS[ticket.status].label}</Badge></dd></div>
                        <Row label="Loại yêu cầu" value={meta.label} />
                        <Row label="Ngày tạo" value={new Date(ticket.createdAt).toLocaleDateString('vi-VN')} />
                        <Row label="Cập nhật cuối" value={new Date(ticket.updatedAt).toLocaleDateString('vi-VN')} />
                        <Row label="Số tin nhắn" value={String(ticket.messages.length)} />
                    </dl>
                </div>

                {ticket.order && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="font-semibold text-gray-900">Đơn hàng liên quan</p>
                            <Link href={`/orders/${ticket.order.id}`} className="text-xs text-blue-600 hover:underline">Xem chi tiết</Link>
                        </div>
                        <p className="text-xs text-gray-400">{ticket.order.code}{relatedOrder.data ? ` · ${new Date(relatedOrder.data.createdAt).toLocaleDateString('vi-VN')}` : ''}</p>
                        {firstItem && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                                    {firstItem.image ? <Image src={firstItem.image} alt="" fill sizes="40px" className="object-contain p-0.5" /> : <Package className="m-2 h-6 w-6 text-gray-300" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="line-clamp-1 text-xs text-gray-700">{firstItem.name}</span>
                                    <span className="text-xs text-gray-400">{firstItem.quantity} × {formatVnd(firstItem.unitPrice)}</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {!closed && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-900">Hành động</p>
                        <button onClick={() => setClosing(true)} className="w-full cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Đóng yêu cầu</button>
                    </div>
                )}
            </aside>

            <ConfirmDialog open={closing} title="Đóng yêu cầu" message="Bạn xác nhận vấn đề đã được giải quyết và muốn đóng yêu cầu này?" confirmText="Đóng yêu cầu"
                loading={close.isPending} error={close.isError ? getApiErrorMessage(close.error) : undefined}
                onClose={() => setClosing(false)} onConfirm={() => close.mutate(undefined, { onSuccess: () => setClosing(false) })} />
        </>
    );
}

const selectedIdHidden = () => '';

function Row({ label, value }: { label: string; value: string }) {
    return <div className="flex items-center justify-between gap-2"><dt className="text-gray-500">{label}</dt><dd className="font-medium text-gray-800">{value}</dd></div>;
}

function FaqAccordion() {
    const [open, setOpen] = useState<number | null>(null);
    return (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {SUPPORT_FAQ.map((f, i) => (
                <div key={i}>
                    <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">
                        {f.q}<ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition ${open === i ? 'rotate-180' : ''}`} />
                    </button>
                    {open === i && <p className="px-3 pb-3 text-xs text-gray-500">{f.a}</p>}
                </div>
            ))}
        </div>
    );
}

export default function SupportPage() {
    return (
        <Suspense fallback={<p className="py-16 text-center text-sm text-gray-400">Đang tải…</p>}>
            <SupportView />
        </Suspense>
    );
}