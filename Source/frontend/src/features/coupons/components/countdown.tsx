'use client';
import { useEffect, useState } from 'react';

export function Countdown({ to, onEnd }: { to: string; onEnd?: () => void }) {
    const [ms, setMs] = useState(() => new Date(to).getTime() - Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            const left = new Date(to).getTime() - Date.now();
            setMs(left);
            if (left <= 0) {
                clearInterval(id);
                onEnd?.();
            }
        }, 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [to]);

    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const hh = String(Math.floor((total % 86400) / 3600)).padStart(2, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');

    return <span className="font-mono tabular-nums">{d > 0 ? `${d} ngày ` : ''}{hh}:{mm}:{ss}</span>;
}
