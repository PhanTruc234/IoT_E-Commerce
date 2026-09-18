'use client';
import { useState } from 'react';
import { CheckCircle2, Eye, ScrollText, Search, XCircle } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Modal } from '@/shared/ui/modal';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuditLogs } from '@/features/audit/hooks/use-audit';
import type { AuditLog } from '@/features/audit/types';
import { useBrandOptions, useCategoryOptions } from '@/features/products/hooks/use-selects';

const ACTION: Record<string, { label: string; color: 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'indigo' }> = {
    LOGIN: { label: 'Đăng nhập', color: 'green' },
    REGISTER: { label: 'Đăng ký', color: 'green' },
    APPROVE: { label: 'Duyệt', color: 'green' },
    LOGOUT: { label: 'Đăng xuất', color: 'gray' },
    LOGIN_FAILED: { label: 'Đăng nhập thất bại', color: 'red' },
    DELETE: { label: 'Xoá', color: 'red' },
    REJECT: { label: 'Từ chối', color: 'red' },
    CANCEL_ORDER: { label: 'Huỷ đơn', color: 'red' },
    CREATE: { label: 'Tạo mới', color: 'blue' },
    PLACE_ORDER: { label: 'Đặt hàng', color: 'blue' },
    GENERATE: { label: 'Sinh serial', color: 'blue' },
    UPDATE: { label: 'Cập nhật', color: 'amber' },
    STATUS_CHANGE: { label: 'Đổi trạng thái', color: 'amber' },
    ANSWER: { label: 'Trả lời', color: 'amber' },
    ACTIVATE: { label: 'Kích hoạt', color: 'amber' },
};

const ENTITY: Record<string, string> = {
    PRODUCT: 'Sản phẩm',
    CATEGORY: 'Danh mục',
    BRAND: 'Thương hiệu',
    ORDER: 'Đơn hàng',
    REVIEW: 'Đánh giá',
    QUESTION: 'Câu hỏi',
    SERIAL: 'Serial',
    SPECIFICATION: 'Thông số',
    VARIANT: 'Biến thể',
    COMBO: 'Combo',
    PRODUCT_IMAGE: 'Ảnh sản phẩm',
    ATTRIBUTE: 'Thuộc tính',
    AUTH: 'Tài khoản',
    OTHER: 'Khác',
};

const FIELD: Record<string, string> = {
    name: 'Tên',
    price: 'Giá',
    salePrice: 'Giá khuyến mãi',
    stockQuantity: 'Tồn kho',
    parentId: 'Danh mục cha',
    icon: 'Biểu tượng',
    sortOrder: 'Thứ tự',
    description: 'Mô tả',
    categoryId: 'Danh mục',
    brandId: 'Thương hiệu',
    status: 'Trạng thái',
    quantity: 'Số lượng',
    rating: 'Số sao',
    comment: 'Bình luận',
    answer: 'Câu trả lời',
    recipientName: 'Người nhận',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    note: 'Ghi chú',
    paymentMethod: 'Thanh toán',
    warrantyMonths: 'Bảo hành (tháng)',
    codes: 'Danh sách serial',
    content: 'Nội dung',
    isActive: 'Kích hoạt',
    role: 'Vai trò',
    variantId: 'Biến thể',
    ownerName: 'Tên khách',
    ownerPhone: 'SĐT khách',
};

function actionOf(a: string) {
    return ACTION[a] ?? { label: a, color: 'gray' as const };
}

function fieldLabel(key: string) {
    return FIELD[key] ?? key;
}

function renderValue(key: string, value: unknown, names: { cat: Map<string, string>; brand: Map<string, string> }): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    if ((key === 'categoryId' || key === 'parentId') && typeof value === 'string') {
        return names.cat.get(value) ?? value;
    }
    if (key === 'brandId' && typeof value === 'string') {
        return names.brand.get(value) ?? value;
    }
    if ((key === 'price' || key === 'salePrice') && typeof value === 'number') {
        return formatVnd(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'Có' : 'Không';
    }
    if (Array.isArray(value)) {
        return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

export default function AdminAuditLogsPage() {
    const [page, setPage] = useState(1);
    const [role, setRole] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [detail, setDetail] = useState<AuditLog | null>(null);

    const { data, isLoading, isError, error, isFetching } = useAuditLogs({
        page,
        limit: 20,
        role: role || undefined,
        search: search || undefined,
    });

    const cats = useCategoryOptions();
    const brands = useBrandOptions();
    const nameMaps = {
        cat: new Map((cats.data ?? []).map((c) => [c.id, c.label.replace(/^(—\s)+/, '')])),
        brand: new Map((brands.data ?? []).map((b) => [b.id, b.name])),
    };
    const metaEntries = detail?.metadata ? Object.entries(detail.metadata) : [];

    return (
        <div>
            <PageHeader title="Nhật ký thao tác" description="Truy vết hành động của khách hàng và quản trị viên." />

            <div className="mb-4 flex flex-wrap gap-2">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setSearch(searchInput.trim());
                    }}
                    className="relative w-full max-w-xs"
                >
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Email / mô tả…" className="pl-9" />
                </form>
                <Select
                    value={role}
                    onChange={(e) => {
                        setPage(1);
                        setRole(e.target.value);
                    }}
                    className="w-44"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="CUSTOMER">Khách hàng</option>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Spinner />
                    </div>
                ) : isError ? (
                    <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Thời gian</th>
                                    <th className="px-4 py-3">Người thực hiện</th>
                                    <th className="px-4 py-3">Hành động</th>
                                    <th className="px-4 py-3">Đối tượng</th>
                                    <th className="px-4 py-3">Kết quả</th>
                                    <th className="px-4 py-3 text-right">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data!.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            <ScrollText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                            Chưa có nhật ký.
                                        </td>
                                    </tr>
                                )}
                                {data!.data.map((l) => {
                                    const ok = l.statusCode < 400;
                                    return (
                                        <tr key={l.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-xs text-gray-500">{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-800">{l.actorEmail ?? '—'}</p>
                                                {l.role && <Badge color={l.role === 'ADMIN' ? 'indigo' : 'gray'}>{l.role === 'ADMIN' ? 'Quản trị' : 'Khách'}</Badge>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={actionOf(l.action).color}>{actionOf(l.action).label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{l.entity ? ENTITY[l.entity] ?? l.entity : '—'}</td>
                                            <td className="px-4 py-3">
                                                {ok ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> Thành công</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> Thất bại</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setDetail(l)} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {data && data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} bản ghi
                    </span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
                            Trước
                        </Button>
                        <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}

            {detail && (
                <Modal
                    open
                    onClose={() => setDetail(null)}
                    title="Chi tiết nhật ký"
                    size="lg"
                    footer={
                        <Button variant="secondary" type="button" onClick={() => setDetail(null)}>
                            Đóng
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge color={actionOf(detail.action).color}>{actionOf(detail.action).label}</Badge>
                            {detail.entity && <span className="text-sm font-medium text-gray-700">{ENTITY[detail.entity] ?? detail.entity}</span>}
                            {detail.statusCode < 400 ? (
                                <span className="inline-flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Thành công</span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> Thất bại</span>
                            )}
                        </div>

                        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1">
                                <dt className="text-gray-400">Thời gian</dt>
                                <dd className="text-right text-gray-800">{new Date(detail.createdAt).toLocaleString('vi-VN')}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1">
                                <dt className="text-gray-400">Người thực hiện</dt>
                                <dd className="truncate text-right text-gray-800">{detail.actorEmail ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1">
                                <dt className="text-gray-400">Vai trò</dt>
                                <dd className="text-right text-gray-800">{detail.role === 'ADMIN' ? 'Quản trị viên' : detail.role === 'CUSTOMER' ? 'Khách hàng' : '—'}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-b border-gray-50 py-1">
                                <dt className="text-gray-400">Địa chỉ IP</dt>
                                <dd className="text-right text-gray-800">{detail.ipAddress ?? '—'}</dd>
                            </div>
                        </dl>

                        {metaEntries.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-900">Dữ liệu thay đổi</p>
                                <div className="overflow-hidden rounded-lg border border-gray-100">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-50">
                                            {metaEntries.map(([key, value]) => (
                                                <tr key={key}>
                                                    <td className="w-2/5 bg-gray-50 px-3 py-2 font-medium text-gray-600">{fieldLabel(key)}</td>
                                                    <td className="wrap-break-word px-3 py-2 text-gray-800">{renderValue(key, value, nameMaps)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer">Thông tin kỹ thuật</summary>
                            <p className="mt-1 break-all">{detail.method} {detail.path} → {detail.statusCode}</p>
                            <p className="mt-1 break-all">{detail.userAgent ?? '—'}</p>
                        </details>
                    </div>
                </Modal>
            )}
        </div>
    );
}
