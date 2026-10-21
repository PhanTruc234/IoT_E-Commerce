'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Spinner } from '@/shared/ui/spinner';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { formatVnd } from '@/shared/lib/format';
import { useTaxSetting, useUpdateTaxSetting } from '@/features/tax/hooks/use-tax';
import type { TaxSetting } from '@/features/tax/api/tax.api';

export default function AdminTaxPage() {
    const { data, isLoading } = useTaxSetting();
    if (isLoading || !data) return <div className="flex justify-center py-16"><Spinner /></div>;
    // key: khi dữ liệu đổi (sau khi lưu) form khởi tạo lại từ giá trị mới
    return <TaxForm key={`${data.enabled}-${data.rate}-${data.pricesIncludeTax}`} data={data} />;
}

function TaxForm({ data }: { data: TaxSetting }) {
    const update = useUpdateTaxSetting();
    const [enabled, setEnabled] = useState(data.enabled);
    const [rate, setRate] = useState(String(data.rate));
    const [included, setIncluded] = useState(data.pricesIncludeTax);

    const r = Number(rate);
    const sample = 1_000_000;
    const sampleTax = included ? Math.round((sample * r) / (100 + r)) : Math.round((sample * r) / 100);
    const dirty = enabled !== data.enabled || r !== data.rate || included !== data.pricesIncludeTax;

    return (
        <div>
            <PageHeader title="Thuế VAT" description="Áp dụng cho đơn đặt từ lúc lưu. Mỗi đơn lưu lại thuế suất và tiền VAT lúc đặt, nên đổi ở đây không làm thay đổi đơn cũ." />
            <div className="max-w-xl space-y-5 rounded-xl border border-gray-200 bg-white p-5">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                        <span className="block text-sm font-medium text-gray-800">Tính VAT cho đơn hàng</span>
                        <span className="block text-xs text-gray-500">Tắt: đơn không ghi nhận VAT, checkout không hiện dòng VAT.</span>
                    </span>
                    <input type="checkbox" className="h-5 w-5" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                </label>
                <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-800">Thuế suất (%)</span>
                    <input type="number" min={0} max={100} step={0.5} value={rate} onChange={(e) => setRate(e.target.value)} disabled={!enabled}
                        className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50" />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                        <span className="block text-sm font-medium text-gray-800">Giá bán đã gồm VAT</span>
                        <span className="block text-xs text-gray-500">Bật: tổng khách trả giữ nguyên, VAT được tách ra từ tổng. Tắt: cộng thêm VAT vào tổng khi thanh toán.</span>
                    </span>
                    <input type="checkbox" className="h-5 w-5" checked={included} onChange={(e) => setIncluded(e.target.checked)} disabled={!enabled} />
                </label>
                {enabled && r > 0 && (
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        Ví dụ đơn {formatVnd(sample)}: {included
                            ? <>khách trả {formatVnd(sample)}, trong đó VAT {r}% là {formatVnd(sampleTax)}.</>
                            : <>khách trả {formatVnd(sample + sampleTax)} (thêm VAT {r}% = {formatVnd(sampleTax)}).</>}
                    </p>
                )}
                <div className="flex items-center gap-3">
                    <button onClick={() => update.mutate({ enabled, rate: r, pricesIncludeTax: included })} disabled={!dirty || update.isPending || !(r >= 0 && r <= 100)}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu cài đặt
                    </button>
                    {update.isError && <span className="text-sm text-red-600">{getApiErrorMessage(update.error)}</span>}
                </div>
            </div>
        </div>
    );
}
