'use client';
import { useEffect, useRef, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/use-cart';
import { useCartUI } from '../store/cart-ui.store';

export function CartButton() {
    const { data } = useCart();
    const setOpen = useCartUI((s) => s.setOpen);
    const count = data?.itemCount ?? 0;

    const [pulse, setPulse] = useState(false);
    const prev = useRef(count);
    useEffect(() => {
        if (count !== prev.current) {
            prev.current = count;
            setPulse(true);
            const t = setTimeout(() => setPulse(false), 300);
            return () => clearTimeout(t);
        }
    }, [count]);

    return (
        <button
            onClick={() => setOpen(true)}
            aria-label="Giỏ hàng"
            className="relative cursor-pointer rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
        >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
                <span className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white transition-transform ${pulse ? 'scale-125' : 'scale-100'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}