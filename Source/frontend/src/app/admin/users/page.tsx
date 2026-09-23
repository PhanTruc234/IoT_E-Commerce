'use client';
import { useState } from 'react';
import { Search, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Spinner } from '@/shared/ui/spinner';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUsers, useSetUserRole, useSetUserStatus } from '@/features/users/hooks/use-users';
import type { AdminUser, UserRole } from '@/features/users/types';

export default function AdminUsersPage() {
    const me = useAuthStore((s) => s.user);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [target, setTarget] = useState<AdminUser | null>(null);

    const { data, isLoading, isError, error, isFetching } = useUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: role || undefined,
        isActive: status || undefined,
    });
    const setUserRole = useSetUserRole();
    const setUserStatus = useSetUserStatus();

    const actionError = setUserRole.error || setUserStatus.error;

    return (
        <div>
            <PageHeader title="Người dùng" description="Quản lý tài khoản và phân quyền." />

            {actionError && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{getApiErrorMessage(actionError)}</div>
            )}

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
                    <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tên / email / SĐT…" className="pl-9" />
                </form>
                <Select
                    value={role}
                    onChange={(e) => {
                        setPage(1);
                        setRole(e.target.value);
                    }}
                    className="w-40"
                >
                    <option value="">Mọi vai trò</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="CUSTOMER">Khách hàng</option>
                </Select>
                <Select
                    value={status}
                    onChange={(e) => {
                        setPage(1);
                        setStatus(e.target.value);
                    }}
                    className="w-40"
                >
                    <option value="">Mọi trạng thái</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Đã khoá</option>
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
                                    <th className="px-4 py-3">Người dùng</th>
                                    <th className="px-4 py-3">SĐT</th>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Đơn</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data!.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                            Không có người dùng.
                                        </td>
                                    </tr>
                                )}
                                {data!.data.map((u) => {
                                    const isSelf = me?.id === u.id;
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{u.fullName}{isSelf && <span className="ml-1 text-xs text-blue-600">(bạn)</span>}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{u.phone ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <Select
                                                    value={u.role}
                                                    disabled={isSelf || setUserRole.isPending}
                                                    onChange={(e) => setUserRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                                                    className="w-32"
                                                >
                                                    <option value="CUSTOMER">Khách hàng</option>
                                                    <option value="ADMIN">Quản trị viên</option>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{u._count.orders}</td>
                                            <td className="px-4 py-3">
                                                {u.isActive ? <Badge color="green">Hoạt động</Badge> : <Badge color="red">Đã khoá</Badge>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!isSelf && (
                                                    u.isActive ? (
                                                        <button
                                                            onClick={() => setTarget(u)}
                                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <ShieldOff className="h-4 w-4" /> Khoá
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setUserStatus.mutate({ id: u.id, isActive: true })}
                                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-green-50 hover:text-green-600"
                                                        >
                                                            <ShieldCheck className="h-4 w-4" /> Mở khoá
                                                        </button>
                                                    )
                                                )}
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
                        Trang {data.meta.page}/{data.meta.totalPages} — {data.meta.total} người dùng
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

            <ConfirmDialog
                open={target !== null}
                title="Khoá tài khoản"
                message={`Khoá tài khoản "${target?.fullName}"? Người dùng sẽ không đăng nhập được.`}
                confirmText="Khoá"
                error={setUserStatus.isError ? getApiErrorMessage(setUserStatus.error) : undefined}
                loading={setUserStatus.isPending}
                onClose={() => {
                    setTarget(null);
                    setUserStatus.reset();
                }}
                onConfirm={() => {
                    if (target) setUserStatus.mutate({ id: target.id, isActive: false }, { onSuccess: () => setTarget(null) });
                }}
            />
        </div>
    );
}
