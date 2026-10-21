'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Badge } from '@/shared/ui/badge';
import { Modal } from '@/shared/ui/modal';
import { Spinner } from '@/shared/ui/spinner';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAdminInvoices, useProcessInvoice } from '@/features/tax/hooks/use-tax';
import { INVOICE_STATUS, type AdminInvoiceRequest, type InvoiceStatus } from '@/features/tax/api/tax.api';

const TABS: { key: InvoiceStatus | undefined; label: string }[] = [
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'ISSUED', label: 'Đã xuất' },
    { key: 'REJECTED', label: 'Từ chối' },
    { key: undefined, label: 'Tất cả' },
];

function ProcessModal({ req, onClose }: { req: AdminInvoiceRequest; onClose: () => void }) {
    const process = useProcessInvoice();
    const [mode, setMode] = useState<'ISSUED' | 'REJECTED'>('ISSUED');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500';
    const submit = () => process.mutate(
        { id: req.id, body: mode === 'ISSUED' ? { status: 'ISSUED', invoiceNumber: invoiceNumber.trim() } : { status: 'REJECTED', adminNote: adminNote.trim() } },
        { onSuccess: onClose },
    );
    return (
        <Modal open onClose={onClose} title={`Hoá đơn cho đơn ${req.order.code}`}
            footer={(
                <button onClick={submit} disabled={process.isPending || (mode === 'ISSUED' ? !invoiceNumber.trim() : adminNote.trim().length < 3)}
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {process.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {mode === 'ISSUED' ? 'Xác nhận đã xuất' : 'Từ chối yêu cầu'}
                </button>
            )}>
            <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3 text-gray-700">
                    <p>{req.buyerType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}: <b>{req.buyerName}</b>{req.taxCode && <> · MST {req.taxCode}</>}</p>
                    <p>Địa chỉ: {req.address}</p>
                    <p>Email: {req.email}</p>
                    <p>Tổng đơn {formatVnd(req.order.total)}{req.order.taxRate != null && <> · VAT {req.order.taxRate}% = {formatVnd(req.order.taxAmount)}</>}</p>
                    {req.note && <p className="text-gray-500">Ghi chú: {req.note}</p>}
                </div>
                <div className="flex gap-2">
                    {(['ISSUED', 'REJECTED'] as const).map((m) => (
                        <button key={m} type="button" onClick={() => setMode(m)}
                            className={`flex-1 cursor-pointer rounded-lg border px-3 py-1.5 ${mode === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                            {m === 'ISSUED' ? 'Đã xuất hoá đơn' : 'Từ chối'}
                        </button>
                    ))}
                </div>
                {mode === 'ISSUED'
                    ? <input className={input} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Số hoá đơn (VD 0000123)" />
                    : <textarea className={input} rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Lý do từ chối (khách sẽ thấy)" />}
                {process.isError && <p className="text-red-600">{getApiErrorMessage(process.error)}</p>}
            </div>
        </Modal>
    );
}

export default function AdminInvoicesPage() {
    const [status, setStatus] = useState<InvoiceStatus | undefined>('PENDING');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAdminInvoices({ status, page });
    const [selected, setSelected] = useState<AdminInvoiceRequest | null>(null);

    return (
        <div>
            <PageHeader title="Yêu cầu xuất hoá đơn" description="Khách gửi từ trang chi tiết đơn hàng. Xuất hoá đơn trên phần mềm hoá đơn điện tử rồi ghi lại số hoá đơn ở đây." />
            <div className="mb-4 flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button key={t.label} onClick={() => { setStatus(t.key); setPage(1); }}
                        className={`cursor-pointer rounded-full px-3 py-1 text-sm ${status === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'}`}>
                        {t.label}{t.key === 'PENDING' && data ? ` (${data.pending})` : ''}
                    </button>
                ))}
            </div>
            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr><th className="p-3">Đơn</th><th className="p-3">Người mua</th><th className="p-3">MST</th><th className="p-3 text-right">VAT</th><th className="p-3">Trạng thái</th><th className="p-3" /></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.data.map((r) => (
                                <tr key={r.id}>
                                    <td className="p-3"><Link href={`/admin/orders/${r.order.id}`} className="font-mono text-blue-600 hover:underline">{r.order.code}</Link>
                                        <span className="block text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('vi-VN')}</span></td>
                                    <td className="p-3">{r.buyerName}<span className="block text-xs text-gray-400">{r.email}</span></td>
                                    <td className="p-3 text-gray-600">{r.taxCode ?? '—'}</td>
                                    <td className="p-3 text-right">{r.order.taxRate != null ? formatVnd(r.order.taxAmount) : '—'}</td>
                                    <td className="p-3"><Badge color={INVOICE_STATUS[r.status].color}>{INVOICE_STATUS[r.status].label}</Badge>
                                        {r.invoiceNumber && <span className="block text-xs text-gray-500">Số {r.invoiceNumber}</span>}</td>
                                    <td className="p-3 text-right">
                                        {r.status === 'PENDING' && <button onClick={() => setSelected(r)} className="cursor-pointer rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">Xử lý</button>}
                                    </td>
                                </tr>
                            ))}
                            {data?.data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Không có yêu cầu.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {data && data.meta.totalPages > 1 && (
                <div className="mt-3 flex justify-end gap-2 text-sm">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer rounded border border-gray-200 px-3 py-1 disabled:opacity-40">Trước</button>
                    <span className="px-2 py-1 text-gray-500">{page}/{data.meta.totalPages}</span>
                    <button disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer rounded border border-gray-200 px-3 py-1 disabled:opacity-40">Sau</button>
                </div>
            )}
            {selected && <ProcessModal req={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
