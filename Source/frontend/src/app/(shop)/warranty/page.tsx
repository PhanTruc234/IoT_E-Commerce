'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock, Search, ShieldCheck, XCircle } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { serialsApi } from '@/features/serials/api/serials.api';
import type { WarrantyLookup } from '@/features/serials/types';
import { useMutation } from '@tanstack/react-query';

export default function WarrantyPage() {
    const [code, setCode] = useState('');
    const lookup = useMutation({ mutationFn: (c: string) => serialsApi.lookup(c) });
    const result = lookup.data as WarrantyLookup | undefined;

    return (
        <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
                <h1 className="mt-3 text-2xl font-bold text-gray-900">Tra cứu bảo hành</h1>
                <p className="mt-1 text-sm text-gray-500">Nhập số serial in trên sản phẩm/tem bảo hành để kiểm tra tình trạng.</p>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); if (code.trim()) lookup.mutate(code.trim()); }}
                className="mt-6 flex gap-2"
            >
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="VD: LUMI-2024-000123"
                        className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <button type="submit" disabled={lookup.isPending || !code.trim()}
                    className="cursor-pointer rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {lookup.isPending ? 'Đang tra…' : 'Tra cứu'}
                </button>
            </form>

            {lookup.isError && <p className="mt-4 text-center text-sm text-red-600">{getApiErrorMessage(lookup.error)}</p>}

            {result && !result.found && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                    <XCircle className="mx-auto h-8 w-8 text-amber-500" />
                    <p className="mt-2 text-sm text-amber-700">Không tìm thấy serial <b>{code}</b>. Vui lòng kiểm tra lại hoặc liên hệ CSKH.</p>
                </div>
            )}

            {result && result.found && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-4">
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            {result.product.image && <Image src={result.product.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                        </span>
                        <div className="min-w-0">
                            <Link href={`/products/${result.product.slug}`} className="font-semibold text-gray-900 hover:text-blue-600">{result.product.name}</Link>
                            {result.variantLabel && <p className="text-xs text-indigo-600">{result.variantLabel}</p>}
                            <p className="text-xs text-gray-400">Serial: {result.code}</p>
                        </div>
                    </div>

                    <div className="mt-5">
                        {result.state === 'ACTIVE' ? (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                <CheckCircle2 className="h-5 w-5" /> Còn bảo hành — còn {result.daysRemaining} ngày
                            </div>
                        ) : result.state === 'EXPIRED' ? (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                <XCircle className="h-5 w-5" /> Đã hết hạn bảo hành
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">
                                <Clock className="h-5 w-5" /> Chưa kích hoạt bảo hành
                            </div>
                        )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-xs text-gray-400">Thời hạn</dt><dd className="text-gray-800">{result.warrantyMonths} tháng</dd></div>
                        <div><dt className="text-xs text-gray-400">Ngày kích hoạt</dt><dd className="text-gray-800">{result.activatedAt ? new Date(result.activatedAt).toLocaleDateString('vi-VN') : '—'}</dd></div>
                        <div><dt className="text-xs text-gray-400">Hết hạn</dt><dd className="text-gray-800">{result.warrantyEndAt ? new Date(result.warrantyEndAt).toLocaleDateString('vi-VN') : '—'}</dd></div>
                    </dl>
                </div>
            )}
        </div>
    );
}