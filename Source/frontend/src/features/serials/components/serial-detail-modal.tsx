'use client';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { SERIAL_STATUS, WARRANTY_STATE } from '../constants';
import type { SerialRow } from '../types';

const d = (s: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—');

export function SerialDetailModal({ serial, onClose }: { serial: SerialRow; onClose: () => void }) {
    return (
        <Modal open onClose={onClose} title="Chi tiết Serial"
            footer={<Button variant="secondary" type="button" onClick={onClose}>Đóng</Button>}>
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-gray-400">Serial Number</p><p className="font-semibold text-gray-900">{serial.code}</p></div>
                    <div><p className="text-xs text-gray-400">Trạng thái</p><Badge color={SERIAL_STATUS[serial.status].color}>{SERIAL_STATUS[serial.status].label}</Badge></div>
                    <div><p className="text-xs text-gray-400">Sản phẩm</p><p className="text-gray-800">{serial.productName}{serial.variantLabel ? ` (${serial.variantLabel})` : ''}</p></div>
                    <div><p className="text-xs text-gray-400">SKU</p><p className="text-gray-800">{serial.sku}</p></div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Thông tin bán hàng</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-400">Đơn hàng</p><p className="text-gray-800">{serial.orderCode ?? '—'}</p></div>
                        <div><p className="text-xs text-gray-400">Ngày bán</p><p className="text-gray-800">{d(serial.activatedAt)}</p></div>
                        <div className="col-span-2"><p className="text-xs text-gray-400">Khách hàng</p><p className="text-gray-800">{serial.ownerName ?? '—'}{serial.ownerPhone ? ` · ${serial.ownerPhone}` : ''}</p></div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Bảo hành</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-400">Thời hạn</p><p className="text-gray-800">{serial.warrantyMonths} tháng</p></div>
                        <div><p className="text-xs text-gray-400">Tình trạng</p><Badge color={WARRANTY_STATE[serial.state].color}>{WARRANTY_STATE[serial.state].label}</Badge></div>
                        <div><p className="text-xs text-gray-400">Bắt đầu</p><p className="text-gray-800">{d(serial.activatedAt)}</p></div>
                        <div><p className="text-xs text-gray-400">Kết thúc</p><p className="text-gray-800">{d(serial.warrantyEndAt)}</p></div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}