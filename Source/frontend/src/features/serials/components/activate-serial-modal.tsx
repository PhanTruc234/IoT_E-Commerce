'use client';
import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field } from '@/shared/ui/field';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { CustomerPickerModal } from '@/features/users/components/customer-picker-modal';
import { useActivateSerial } from '../hooks/use-serials';
import type { SerialRow } from '../types';

export function ActivateSerialModal({ serial, onClose }: { serial: SerialRow; onClose: () => void }) {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [ownerName, setOwnerName] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [ownerUserId, setOwnerUserId] = useState<string | undefined>(undefined);
    const [pickerOpen, setPickerOpen] = useState(false);
    const activate = useActivateSerial();

    const clearCustomer = () => { setOwnerUserId(undefined); setOwnerName(''); setOwnerPhone(''); };

    return (
        <Modal open onClose={onClose} title={`Kích hoạt bảo hành — ${serial.code}`}
            footer={<>
                <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                <Button type="button" disabled={activate.isPending}
                    onClick={() => activate.mutate({
                        id: serial.id,
                        body: { activatedAt: new Date(date).toISOString(), ownerName: ownerName || undefined, ownerPhone: ownerPhone || undefined, ownerUserId },
                    }, { onSuccess: onClose })}>
                    {activate.isPending ? 'Đang lưu…' : 'Kích hoạt'}
                </Button>
            </>}>
            <div className="space-y-4">
                <p className="text-sm text-gray-500">Bảo hành <b>{serial.warrantyMonths} tháng</b> tính từ ngày kích hoạt.</p>

                <Field label="Ngày kích hoạt"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>

                <Field label="Khách hàng">
                    {ownerUserId ? (
                        <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm">
                            <span className="text-green-700">{ownerName}{ownerPhone ? ` · ${ownerPhone}` : ''}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setPickerOpen(true)} className="cursor-pointer text-xs text-blue-600 hover:underline">Đổi</button>
                                <button type="button" onClick={clearCustomer} className="cursor-pointer text-gray-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="secondary" type="button" onClick={() => setPickerOpen(true)}>
                            <UserPlus className="h-4 w-4" /> Chọn khách hàng
                        </Button>
                    )}
                </Field>

                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-xs text-gray-500">Hoặc nhập tay (khách không có tài khoản):</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="Tên khách" value={ownerName} onChange={(e) => { setOwnerName(e.target.value); setOwnerUserId(undefined); }} />
                        <Input placeholder="SĐT khách" value={ownerPhone} onChange={(e) => { setOwnerPhone(e.target.value); setOwnerUserId(undefined); }} />
                    </div>
                </div>

                {activate.isError && <p className="text-sm text-red-600">{getApiErrorMessage(activate.error)}</p>}
            </div>

            {pickerOpen && (
                <CustomerPickerModal
                    selectedId={ownerUserId}
                    onPick={(c) => { setOwnerName(c.fullName); setOwnerPhone(c.phone ?? ''); setOwnerUserId(c.id); }}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </Modal>
    );
}