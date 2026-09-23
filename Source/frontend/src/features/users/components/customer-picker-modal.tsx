'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Search } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { usersApi, type CustomerOption } from '../api/users.api';

export function CustomerPickerModal({ selectedId, onPick, onClose }: {
    selectedId?: string;
    onPick: (c: CustomerOption) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const q = useQuery({
        queryKey: ['admin', 'customers', search],
        queryFn: () => usersApi.searchCustomers(search.trim()),
    });
    const list = q.data ?? [];

    return (
        <Modal open onClose={onClose} title="Chọn khách hàng" size="lg"
            footer={<Button variant="secondary" type="button" onClick={onClose}>Đóng</Button>}>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên / email / SĐT…" className="w-full py-2 text-sm outline-none" />
            </div>

            {q.isLoading ? (
                <p className="py-8 text-center text-sm text-gray-400">Đang tải…</p>
            ) : list.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">Không có khách hàng phù hợp.</p>
            ) : (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
                    {list.map((c) => (
                        <li key={c.id}>
                            <button type="button" onClick={() => { onPick(c); onClose(); }}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50">
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-gray-800">{c.fullName}</span>
                                    <span className="block text-xs text-gray-400">{c.email}{c.phone ? ` · ${c.phone}` : ''}</span>
                                </span>
                                {selectedId === c.id && <Check className="h-4 w-4 shrink-0 text-green-600" />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
}