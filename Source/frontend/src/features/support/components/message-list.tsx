'use client';
import Image from 'next/image';
import { Headset } from 'lucide-react';
import type { SupportMessage } from '../types';

export function MessageList({ messages, perspective = 'customer' }: { messages: SupportMessage[]; perspective?: 'customer' | 'staff' }) {
    if (!messages.length) return <p className="py-6 text-center text-sm text-gray-400">Chưa có tin nhắn.</p>;
    return (
        <div className="space-y-4">
            {messages.map((m) => {
                const mine = perspective === 'staff' ? m.isStaff : !m.isStaff;
                const who = m.isStaff ? (m.sender?.fullName ?? 'Nhân viên hỗ trợ') : (m.sender?.fullName ?? 'Khách hàng');
                return (
                    <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${m.isStaff ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                            {m.isStaff ? <Headset className="h-4 w-4" /> : who.charAt(0).toUpperCase()}
                        </span>
                        <div className="max-w-[80%]">
                            <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                {m.body && <p className="whitespace-pre-wrap wrap-break-word">{m.body}</p>}
                                {m.attachments.length > 0 && (
                                    <div className={`flex flex-wrap gap-2 ${m.body ? 'mt-2' : ''}`}>
                                        {m.attachments.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="relative block h-24 w-24 overflow-hidden rounded-lg border border-black/10 bg-white">
                                                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className={`mt-1 text-[11px] text-gray-400 ${mine ? 'text-right' : ''}`}>{who} · {new Date(m.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}