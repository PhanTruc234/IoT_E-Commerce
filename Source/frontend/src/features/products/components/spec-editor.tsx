'use client';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import {
    useCreateSpecification,
    useSpecifications,
} from '@/features/specifications/hooks/use-specifications';
import type { SpecDataType } from '@/features/specifications/types';
import { useProductSpecs, useReplaceProductSpecs } from '../hooks/use-product-specs';

interface Row {
    key: string;
    specificationId: string;
    value: string;
}
let rowSeq = 0;
const newRow = (specificationId = '', value = ''): Row => ({
    key: `r${rowSeq++}`,
    specificationId,
    value,
});

const GRID = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_40px] items-center gap-2';

export function SpecEditor({ productId }: { productId: string }) {
    const dict = useSpecifications();
    const productSpecs = useProductSpecs(productId);
    const replace = useReplaceProductSpecs(productId);
    const createSpec = useCreateSpecification();

    const [rows, setRows] = useState<Row[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newSpec, setNewSpec] = useState<{ name: string; unit: string; dataType: SpecDataType }>({
        name: '',
        unit: '',
        dataType: 'TEXT',
    });

    useEffect(() => {
        if (productSpecs.data) {
            setRows(productSpecs.data.map((ps) => newRow(ps.specificationId, ps.value)));
        }
    }, [productSpecs.data]);

    const usedIds = useMemo(
        () => new Set(rows.map((r) => r.specificationId).filter(Boolean)),
        [rows],
    );
    const dictEmpty = dict.data && dict.data.length === 0;

    const updateRow = (key: string, patch: Partial<Row>) =>
        setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));

    const onSave = () => {
        const items = rows
            .filter((r) => r.specificationId && r.value.trim())
            .map((r) => ({ specificationId: r.specificationId, value: r.value.trim() }));
        replace.mutate(items);
    };

    const onCreateSpec = () => {
        if (!newSpec.name.trim()) return;
        createSpec.mutate(
            { name: newSpec.name.trim(), unit: newSpec.unit.trim() || undefined, dataType: newSpec.dataType },
            {
                onSuccess: (spec) => {
                    setRows((rs) => [...rs, newRow(spec.id, '')]);
                    setNewSpec({ name: '', unit: '', dataType: 'TEXT' });
                    setShowCreate(false);
                },
            },
        );
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-gray-900">Thông số kỹ thuật</h3>
                    <p className="text-xs text-gray-500">
                        B1: tạo thông số vào từ điển · B2: “Thêm dòng” → chọn thông số & nhập giá trị.
                    </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreate((s) => !s)}>
                    <Plus className="h-4 w-4" /> Thông số mới
                </Button>
            </div>
            {dict.isError && (
                <p className="mb-3 text-sm text-red-600">{getApiErrorMessage(dict.error)}</p>
            )}
            {showCreate && (
                <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                    <p className="mb-2 text-xs font-medium text-blue-700">Tạo thông số vào từ điển (dùng lại cho mọi sản phẩm)</p>
                    <div className="grid gap-2 sm:grid-cols-[1fr_130px_130px_auto]">
                        <Input placeholder="Tên (VD: WiFi)" value={newSpec.name} onChange={(e) => setNewSpec((s) => ({ ...s, name: e.target.value }))} />
                        <Input placeholder="Đơn vị (VD: GHz)" value={newSpec.unit} onChange={(e) => setNewSpec((s) => ({ ...s, unit: e.target.value }))} />
                        <Select value={newSpec.dataType} onChange={(e) => setNewSpec((s) => ({ ...s, dataType: e.target.value as SpecDataType }))}>
                            <option value="TEXT">Chữ</option>
                            <option value="NUMBER">Số</option>
                            <option value="BOOLEAN">Có/Không</option>
                        </Select>
                        <Button type="button" size="sm" onClick={onCreateSpec} disabled={createSpec.isPending}>
                            {createSpec.isPending ? 'Đang tạo…' : 'Tạo'}
                        </Button>
                    </div>
                    {createSpec.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(createSpec.error)}</p>}
                </div>
            )}

            {productSpecs.isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Đang tải…</p>
            ) : dictEmpty ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                    <p className="text-sm text-gray-500">Từ điển thông số đang trống.</p>
                    <Button type="button" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4" /> Tạo thông số đầu tiên
                    </Button>
                </div>
            ) : (
                <>
                    {rows.length > 0 && (
                        <div className={`${GRID} px-1 pb-1 text-xs font-medium uppercase tracking-wide text-gray-400`}>
                            <span>Thông số</span>
                            <span>Giá trị</span>
                            <span />
                        </div>
                    )}

                    <div className="space-y-2">
                        {rows.length === 0 && (
                            <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                                Chưa có dòng nào. Bấm “Thêm dòng”.
                            </p>
                        )}
                        {rows.map((row) => {
                            const spec = dict.data?.find((s) => s.id === row.specificationId);
                            return (
                                <div key={row.key} className={GRID}>
                                    <Select
                                        value={row.specificationId}
                                        onChange={(e) => updateRow(row.key, { specificationId: e.target.value })}
                                    >
                                        <option value="">— Chọn thông số —</option>
                                        {dict.data?.map((s) => (
                                            <option key={s.id} value={s.id} disabled={usedIds.has(s.id) && s.id !== row.specificationId}>
                                                {s.name}{s.unit ? ` (${s.unit})` : ''}
                                            </option>
                                        ))}
                                    </Select>
                                    <Input
                                        placeholder={spec?.unit ? `Giá trị (${spec.unit})` : 'Nhập giá trị'}
                                        value={row.value}
                                        onChange={(e) => updateRow(row.key, { value: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.key)}
                                        className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                        title="Xóa dòng"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setRows((rs) => [...rs, newRow()])}>
                            <Plus className="h-4 w-4" /> Thêm dòng
                        </Button>
                        <div className="flex items-center gap-3">
                            {replace.isSuccess && <span className="text-sm text-green-600">Đã lưu.</span>}
                            <Button type="button" onClick={onSave} disabled={replace.isPending}>
                                <Save className="h-4 w-4" /> {replace.isPending ? 'Đang lưu…' : 'Lưu thông số'}
                            </Button>
                        </div>
                    </div>
                    {replace.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(replace.error)}</p>}
                </>
            )}
        </div>
    );
}