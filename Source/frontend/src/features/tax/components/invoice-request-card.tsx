'use client';
import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Modal } from '@/shared/ui/modal';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRequestInvoice } from '../hooks/use-tax';
import { INVOICE_STATUS, type InvoiceBuyerType, type InvoiceRequest } from '../api/tax.api';

const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500';

/** Thẻ "Hoá đơn VAT" trên trang chi tiết đơn của khách: gửi yêu cầu hoặc xem trạng thái. */
export function InvoiceRequestCard({ orderId, request, cancelled }: { orderId: string; request: InvoiceRequest | null | undefined; cancelled: boolean }) {
    const user = useAuthStore((s) => s.user);
    const [open, setOpen] = useState(false);
    const [buyerType, setBuyerType] = useState<InvoiceBuyerType>('PERSONAL');
    const [buyerName, setBuyerName] = useState(user?.fullName ?? '');
    const [taxCode, setTaxCode] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState(user?.email ?? '');
    const [note, setNote] = useState('');
    const mutation = useRequestInvoice();

    if (cancelled && !request) return null;
    const submit = () => mutation.mutate(
        { orderId, buyerType, buyerName, taxCode: taxCode.trim() || undefined, address, email, note: note.trim() || undefined },
        { onSuccess: () => setOpen(false) },
    );

    return (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700"><FileText className="h-4 w-4" /> Hoá đơn VAT</h2>
                {request && <Badge color={INVOICE_STATUS[request.status].color}>{INVOICE_STATUS[request.status].label}</Badge>}
            </div>
            {request ? (
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>{request.buyerType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}: <span className="font-medium text-gray-800">{request.buyerName}</span>{request.taxCode && <> · MST {request.taxCode}</>}</p>
                    <p>Gửi tới: {request.email}</p>
                    {request.invoiceNumber && <p>Số hoá đơn: <span className="font-medium text-gray-800">{request.invoiceNumber}</span></p>}
                    {request.status === 'REJECTED' && request.adminNote && <p className="text-red-600">Lý do: {request.adminNote}</p>}
                </div>
            ) : (
                <>
                    <p className="mt-1 text-xs text-gray-400">Cần hoá đơn đỏ cho công ty hoặc cá nhân? Gửi thông tin, IoTech sẽ xuất hoá đơn điện tử về email của bạn.</p>
                    <button onClick={() => setOpen(true)} className="mt-3 cursor-pointer rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                        Yêu cầu xuất hoá đơn
                    </button>
                </>
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Yêu cầu xuất hoá đơn VAT"
                footer={(
                    <button onClick={submit} disabled={mutation.isPending}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Gửi yêu cầu
                    </button>
                )}
            >
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {(['PERSONAL', 'COMPANY'] as const).map((t) => (
                            <button key={t} type="button" onClick={() => setBuyerType(t)}
                                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm ${buyerType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                                {t === 'PERSONAL' ? 'Cá nhân' : 'Công ty'}
                            </button>
                        ))}
                    </div>
                    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">{buyerType === 'COMPANY' ? 'Tên công ty' : 'Họ tên'}</span>
                        <input className={input} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} /></label>
                    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Mã số thuế {buyerType === 'PERSONAL' && <span className="font-normal text-gray-400">(không bắt buộc)</span>}</span>
                        <input className={input} value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="10 số, chi nhánh: 10 số-3 số" /></label>
                    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Địa chỉ trên hoá đơn</span>
                        <input className={input} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
                    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Email nhận hoá đơn</span>
                        <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
                    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Ghi chú <span className="font-normal text-gray-400">(không bắt buộc)</span></span>
                        <textarea className={input} rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
                    {mutation.isError && <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>}
                </div>
            </Modal>
        </div>
    );
}
