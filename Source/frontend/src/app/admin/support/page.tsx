'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, Search } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAdminTickets, useAdminTicket, useAdminReply, useAdminTicketStatus } from '@/features/support/hooks/use-support';
import { MessageList } from '@/features/support/components/message-list';
import { MessageComposer } from '@/features/support/components/message-composer';
import { TICKET_TYPE, TICKET_STATUS } from '@/features/support/constants';
import type { TicketStatus, TicketType } from '@/features/support/types';

export default function AdminSupportPage() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isError, error, isFetching } = useAdminTickets({
        page, limit: 10, search: search || undefined,
        status: (status || undefined) as TicketStatus | undefined,
        type: (type || undefined) as TicketType | undefined,
    });

    return (
        <div>
            <PageHeader title="Quản lý yêu cầu hỗ trợ" description="Theo dõi và xử lý các yêu cầu hỗ trợ từ khách hàng." />

            <div className="grid gap-4 xl:grid-cols-[1fr_580px]">
                <div>
                    <div className="mb-4 flex flex-wrap gap-2">
                        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="relative w-full max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Mã / tiêu đề / khách…" className="pl-9" />
                        </form>
                        <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="w-44">
                            <option value="">Tất cả trạng thái</option>
                            {Object.entries(TICKET_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </Select>
                        <Select value={type} onChange={(e) => { setPage(1); setType(e.target.value); }} className="w-40">
                            <option value="">Tất cả loại</option>
                            {Object.entries(TICKET_TYPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </Select>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                            : isError ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                                : (
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3">Mã</th>
                                                <th className="px-4 py-3">Tiêu đề</th>
                                                <th className="px-4 py-3">Khách hàng</th>
                                                <th className="px-4 py-3">Đơn</th>
                                                <th className="px-4 py-3">Loại</th>
                                                <th className="px-4 py-3">Trạng thái</th>
                                                <th className="px-4 py-3">Tin</th>
                                                <th className="px-4 py-3">Cập nhật</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data!.data.length === 0 && (
                                                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400"><LifeBuoy className="mx-auto mb-2 h-8 w-8 text-gray-300" />Không có yêu cầu.</td></tr>
                                            )}
                                            {data!.data.map((t) => (
                                                <tr key={t.id} onClick={() => setSelectedId(t.id)}
                                                    className={`cursor-pointer hover:bg-gray-50 ${selectedId === t.id ? 'bg-blue-50/50' : ''}`}>
                                                    <td className="px-4 py-3 font-medium text-blue-600">{t.code}</td>
                                                    <td className="max-w-55 truncate px-4 py-3 text-gray-800">{t.subject}</td>
                                                    <td className="px-4 py-3 text-gray-600">{t.user?.fullName ?? '—'}</td>
                                                    <td className="px-4 py-3 text-gray-500">{t.order?.code ?? '—'}</td>
                                                    <td className="px-4 py-3"><Badge color={TICKET_TYPE[t.type].color}>{TICKET_TYPE[t.type].label}</Badge></td>
                                                    <td className="px-4 py-3"><Badge color={TICKET_STATUS[t.status].color}>{TICKET_STATUS[t.status].label}</Badge></td>
                                                    <td className="px-4 py-3 text-gray-500">{t._count.messages}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(t.updatedAt).toLocaleDateString('vi-VN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                    </div>

                    {data && data.meta.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                            <span>Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} yêu cầu</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                                <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Sau</Button>
                            </div>
                        </div>
                    )}
                </div>


                <div className="xl:sticky xl:top-4 xl:self-start">
                    {selectedId ? <AdminTicketPanel id={selectedId} />
                        : <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">Chọn một yêu cầu để xử lý.</div>}
                </div>
            </div>
        </div>
    );
}

function AdminTicketPanel({ id }: { id: string }) {
    const { data: ticket, isLoading, isError, error } = useAdminTicket(id);
    const reply = useAdminReply(id);
    const setStatus = useAdminTicketStatus(id);
    const [tab, setTab] = useState<'chat' | 'info'>('chat');

    if (isLoading) return <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-16"><Spinner /></div>;
    if (isError || !ticket) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>;

    const meta = TICKET_TYPE[ticket.type];
    return (
        <div className="flex max-h-[85vh] flex-col rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-3">
                <h2 className="truncate text-sm font-bold text-gray-900">Yêu cầu #{ticket.code}</h2>
                <Select value={ticket.status} onChange={(e) => setStatus.mutate(e.target.value as TicketStatus)} disabled={setStatus.isPending} className="w-36">
                    {Object.entries(TICKET_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
            </div>

            <div className="flex border-b border-gray-100 text-sm">
                {(['chat', 'info'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 cursor-pointer py-2 font-medium transition ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'chat' ? 'Trao đổi' : 'Thông tin'}
                    </button>
                ))}
            </div>

            {tab === 'chat' ? (
                <>
                    <div className="flex-1 overflow-y-auto p-4">
                        <MessageList messages={ticket.messages} perspective="staff" />
                    </div>
                    <div className="border-t border-gray-100 p-3">
                        <MessageComposer sending={reply.isPending} placeholder="Trả lời khách hàng…" onSend={(message, attachments) => reply.mutate({ message, attachments })} />
                    </div>
                </>
            ) : (
                <div className="space-y-3 overflow-y-auto p-4 text-sm">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Khách hàng</p>
                        <p className="font-medium text-gray-800">{ticket.user?.fullName ?? '—'}</p>
                        <p className="text-gray-500">{ticket.user?.email}</p>
                        {ticket.user?.phone && <p className="text-gray-500">{ticket.user.phone}</p>}
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Yêu cầu</p>
                        <p className="text-gray-700">{ticket.subject}</p>
                        <p className="mt-1 text-gray-500">Loại: {meta.label}</p>
                        <p className="text-gray-500">Tạo: {new Date(ticket.createdAt).toLocaleString('vi-VN')}</p>
                        {ticket.order && <Link href={`/admin/orders/${ticket.order.id}`} className="mt-1 block text-blue-600 hover:underline">Xem đơn {ticket.order.code}</Link>}
                    </div>
                </div>
            )}
        </div>
    );
}