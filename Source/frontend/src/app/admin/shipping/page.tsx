'use client';
import { useEffect, useState } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import {
    useAdminZones, useUpdateZone, useAdminShippingSetting, useUpdateShippingSetting,
} from '@/features/shipping/hooks/use-shipping';

function ZoneRow({ zone }: { zone: { id: string; name: string; fee: number; provinces: string[]; isDefault: boolean } }) {
    const update = useUpdateZone();
    const [fee, setFee] = useState(zone.fee);
    const [provincesText, setProvincesText] = useState(zone.provinces.join(', '));
    const [open, setOpen] = useState(false);

    const save = () => {
        const provinces = provincesText.split(',').map((s) => s.trim()).filter(Boolean);
        update.mutate({ id: zone.id, body: { fee, provinces } });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-semibold text-gray-900">
                        {zone.name} {zone.isDefault && <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">mặc định</span>}
                    </p>
                    <p className="text-xs text-gray-400">{zone.provinces.length} tỉnh/thành</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Phí:</span>
                    <input type="number" min={0} step={1000} value={fee} onChange={(e) => setFee(Number(e.target.value))}
                        className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    <span className="text-xs text-gray-400">{formatVnd(fee)}</span>
                    <button onClick={save} disabled={update.isPending}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu
                    </button>
                </div>
            </div>
            <button onClick={() => setOpen((o) => !o)} className="mt-2 cursor-pointer text-xs text-blue-600 hover:underline">
                {open ? 'Ẩn danh sách tỉnh' : 'Sửa danh sách tỉnh/thành'}
            </button>
            {open && (
                <textarea value={provincesText} onChange={(e) => setProvincesText(e.target.value)} rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                    placeholder="Các tỉnh cách nhau bởi dấu phẩy" />
            )}
            {update.isError && <p className="mt-2 text-xs text-red-600">{getApiErrorMessage(update.error)}</p>}
        </div>
    );
}

export default function AdminShippingPage() {
    const { data: zones, isLoading, isError, error } = useAdminZones();
    const { data: setting } = useAdminShippingSetting();
    const updateSetting = useUpdateShippingSetting();
    const [threshold, setThreshold] = useState(0);
    useEffect(() => { if (setting) setThreshold(setting.freeShipFrom); }, [setting]);

    return (
        <div>
            <PageHeader title="Cấu hình vận chuyển" description="Phí giao hàng theo khu vực và ngưỡng miễn phí." />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">Miễn phí vận chuyển cho đơn từ:</span>
                    <input type="number" min={0} step={10000} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-40 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    <span className="text-xs text-gray-400">{formatVnd(threshold)}</span>
                    <button onClick={() => updateSetting.mutate(threshold)} disabled={updateSetting.isPending}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {updateSetting.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu
                    </button>
                </div>
            </div>

            {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
                : isError ? <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                    : (
                        <div className="space-y-3">
                            {zones?.map((z) => <ZoneRow key={z.id} zone={z} />)}
                        </div>
                    )}
        </div>
    );
}