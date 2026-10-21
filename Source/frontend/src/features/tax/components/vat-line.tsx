import { formatVnd } from '@/shared/lib/format';

/** Dòng VAT trong phần tổng tiền: giá đã gồm VAT → ghi chú dưới tổng; chưa gồm → dòng cộng thêm. */
export function VatLine({ taxRate, taxAmount, pricesIncludeTax }: { taxRate: number | null; taxAmount: number; pricesIncludeTax: boolean }) {
    if (taxRate == null) return null;
    return pricesIncludeTax ? (
        <p className="text-right text-xs text-gray-500">Đã bao gồm VAT ({taxRate}%): {formatVnd(taxAmount)}</p>
    ) : (
        <div className="flex justify-between text-gray-600"><span>VAT ({taxRate}%)</span><span>+{formatVnd(taxAmount)}</span></div>
    );
}
