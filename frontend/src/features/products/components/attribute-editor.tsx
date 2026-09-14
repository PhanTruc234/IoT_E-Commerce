'use client';
import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useProductAttributes, useReplaceAttributes } from '../hooks/use-product-attributes';

interface OptRow { key: string; value: string }
interface AttrRow { key: string; name: string; isVariant: boolean; options: OptRow[] }
let seq = 0;
const uid = () => `k${seq++}`;
const emptyOpt = (value = ''): OptRow => ({ key: uid(), value });
const emptyAttr = (): AttrRow => ({ key: uid(), name: '', isVariant: true, options: [emptyOpt()] });

export function AttributeEditor({ productId }: { productId: string }) {
    const { data, isLoading } = useProductAttributes(productId);
    const replace = useReplaceAttributes(productId);
    const [attrs, setAttrs] = useState<AttrRow[]>([]);

    useEffect(() => {
        if (data) {
            setAttrs(
                data.map((a) => ({
                    key: uid(),
                    name: a.name,
                    isVariant: a.isVariant,
                    options: a.options.length ? a.options.map((o) => emptyOpt(o.value)) : [emptyOpt()],
                })),
            );
        }
    }, [data]);

    const setAttr = (key: string, patch: Partial<AttrRow>) =>
        setAttrs((as) => as.map((a) => (a.key === key ? { ...a, ...patch } : a)));
    const removeAttr = (key: string) => setAttrs((as) => as.filter((a) => a.key !== key));
    const setOpt = (ak: string, ok: string, value: string) =>
        setAttrs((as) => as.map((a) => (a.key === ak ? { ...a, options: a.options.map((o) => (o.key === ok ? { ...o, value } : o)) } : a)));
    const addOpt = (ak: string) =>
        setAttrs((as) => as.map((a) => (a.key === ak ? { ...a, options: [...a.options, emptyOpt()] } : a)));
    const removeOpt = (ak: string, ok: string) =>
        setAttrs((as) => as.map((a) => (a.key === ak ? { ...a, options: a.options.filter((o) => o.key !== ok) } : a)));

    const onSave = () => {
        const payload = attrs
            .map((a) => ({
                name: a.name.trim(),
                isVariant: a.isVariant,
                options: a.options.map((o) => ({ value: o.value.trim() })).filter((o) => o.value),
            }))
            .filter((a) => a.name && a.options.length > 0);
        replace.mutate(payload);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Thuộc tính</h3>
                <p className="text-xs text-gray-500">Tick “tạo biến thể” cho thuộc tính dùng để sinh biến thể (VD: Dung lượng, Màu).</p>
            </div>

            {isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Đang tải…</p>
            ) : (
                <div className="space-y-4">
                    {attrs.length === 0 && (
                        <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                            Chưa có thuộc tính. Bấm “Thêm thuộc tính”.
                        </p>
                    )}
                    {attrs.map((a) => (
                        <div key={a.key} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Input
                                    placeholder="Tên thuộc tính (VD: Dung lượng Flash)"
                                    value={a.name}
                                    onChange={(e) => setAttr(a.key, { name: e.target.value })}
                                    className="min-w-55 flex-1"
                                />
                                <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-700">
                                    <input type="checkbox" checked={a.isVariant} onChange={(e) => setAttr(a.key, { isVariant: e.target.checked })} className="h-4 w-4 cursor-pointer rounded" />
                                    Tạo biến thể
                                </label>
                                <button type="button" onClick={() => removeAttr(a.key)} className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Xóa thuộc tính">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {a.options.map((o) => (
                                    <div key={o.key} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 pl-2">
                                        <input value={o.value} onChange={(e) => setOpt(a.key, o.key, e.target.value)} placeholder="Giá trị" className="w-28 bg-transparent py-1.5 text-sm outline-none" />
                                        <button type="button" onClick={() => removeOpt(a.key, o.key)} className="cursor-pointer p-1 text-gray-400 hover:text-red-600">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOpt(a.key)} className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">
                                    + Giá trị
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setAttrs((as) => [...as, emptyAttr()])}>
                    <Plus className="h-4 w-4" /> Thêm thuộc tính
                </Button>
                <div className="flex items-center gap-3">
                    {replace.isSuccess && <span className="text-sm text-green-600">Đã lưu.</span>}
                    <Button type="button" onClick={onSave} disabled={replace.isPending}>
                        <Save className="h-4 w-4" /> {replace.isPending ? 'Đang lưu…' : 'Lưu thuộc tính'}
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-xs text-amber-600">Lưu thuộc tính sẽ xoá các biến thể hiện có — cần “Sinh biến thể” lại.</p>
            {replace.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(replace.error)}</p>}
        </div>
    );
}