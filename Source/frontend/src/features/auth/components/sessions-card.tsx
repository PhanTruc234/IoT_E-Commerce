'use client';
import { Loader2, Monitor, Trash2, ShieldAlert } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useSessions, useRevokeSession } from '../hooks/use-sessions';

function parseUA(ua: string | null): string {
    if (!ua) return 'Thiết bị không xác định';
    const browser = /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Trình duyệt';
    const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${browser} · ${os}` : browser;
}

export function SessionsCard() {
    const { data, isLoading, isError, error } = useSessions();
    const revoke = useRevokeSession();

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Monitor className="h-5 w-5 text-blue-600" /> Thiết bị đăng nhập
                </h3>
                <p className="mb-4 mt-1 text-sm text-gray-500">
                    Các phiên đang đăng nhập vào tài khoản của bạn. Thu hồi phiên lạ để bảo vệ tài khoản.
                </p>

                {isLoading ? (
                    <p className="flex items-center gap-2 py-4 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                    </p>
                ) : isError ? (
                    <p className="py-4 text-sm text-red-600">{getApiErrorMessage(error)}</p>
                ) : (data?.length ?? 0) === 0 ? (
                    <p className="py-4 text-sm text-gray-400">Không có phiên nào.</p>
                ) : (
                    <ul className="space-y-3">
                        {data!.map((s) => (
                            <li
                                key={s.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100">
                                        <Monitor className="h-5 w-5 text-gray-500" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-800">
                                            {parseUA(s.userAgent)}
                                            {s.current && (
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    Phiên hiện tại
                                                </span>
                                            )}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-gray-400">
                                            IP {s.ipAddress ?? '—'} · Đăng nhập {new Date(s.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                {!s.current && (
                                    <button
                                        type="button"
                                        onClick={() => revoke.mutate(s.id)}
                                        disabled={revoke.isPending}
                                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                                    >
                                        {revoke.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        Thu hồi
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                <div>
                    <p className="text-sm font-medium text-amber-800">Phát hiện hoạt động đáng ngờ?</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                        Nếu bạn thấy thiết bị lạ, hãy thu hồi phiên đăng nhập và đổi mật khẩu ngay lập tức.
                    </p>
                </div>
            </div>
        </div>
    );
}
