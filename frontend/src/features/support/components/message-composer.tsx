'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Send, X, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { supportApi } from '../api/support.api';

export function MessageComposer({ onSend, sending, placeholder = 'Nhập tin nhắn của bạn…' }: {
    onSend: (message: string, attachments: string[]) => void;
    sending: boolean;
    placeholder?: string;
}) {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const pick = (list: FileList | null) => {
        if (!list) return;
        const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
        setFiles((prev) => [...prev, ...imgs].slice(0, 6));
    };

    const submit = async () => {
        if ((!text.trim() && files.length === 0) || sending || uploading) return;
        setError(null);
        try {
            let urls: string[] = [];
            if (files.length) { setUploading(true); urls = (await supportApi.uploadAttachments(files)).map((u) => u.url); }
            onSend(text.trim(), urls);
            setText(''); setFiles([]);
        } catch (e) { setError(getApiErrorMessage(e)); } finally { setUploading(false); }
    };

    const busy = sending || uploading;
    return (
        <div>
            {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="absolute right-0 top-0 cursor-pointer rounded-bl bg-black/50 p-0.5 text-white"><X className="h-3 w-3" /></button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-end gap-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    placeholder={placeholder}
                    className="max-h-32 min-h-10.5 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
                <button type="button" onClick={() => fileRef.current?.click()} title="Đính kèm ảnh" className="shrink-0 cursor-pointer rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50"><ImagePlus className="h-5 w-5" /></button>
                <button type="button" onClick={submit} disabled={busy || (!text.trim() && files.length === 0)} className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Gửi
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}