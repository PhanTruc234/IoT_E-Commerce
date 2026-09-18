'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../hooks/use-cart';
import { useCartUI } from '../store/cart-ui.store';

export function CartDrawer() {
    const open = useCartUI((s) => s.open);
    const setOpen = useCartUI((s) => s.setOpen);
    const { data, isLoading } = useCart();
    const update = useUpdateCartItem();
    const remove = useRemoveCartItem();

    return (
        <>
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={() => setOpen(false)}
            />
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <ShoppingCart className="h-5 w-5" /> Giỏ hàng
                    </h2>
                    <button onClick={() => setOpen(false)} aria-label="Đóng" className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <p className="py-10 text-center text-sm text-gray-400">Đang tải…</p>
                    ) : !data || data.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingCart className="h-12 w-12 text-gray-200" />
                            <p className="mt-3 text-sm text-gray-500">Giỏ hàng trống.</p>
                            <Link href="/products" onClick={() => setOpen(false)} className="mt-3 text-sm text-blue-600 hover:underline">Mua sắm ngay →</Link>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {data.items.map((it) => (
                                <li key={it.id} className="flex gap-3">
                                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                        {it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/products/${it.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-blue-600">
                                            {it.name}
                                        </Link>
                                        {it.variantLabel && <p className="text-xs text-indigo-600">{it.variantLabel}</p>}
                                        <p className="mt-0.5 text-sm font-semibold text-blue-600">{formatVnd(it.unitPrice)}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center rounded-lg border border-gray-200">
                                                <button onClick={() => update.mutate({ id: it.id, quantity: it.quantity - 1 })} disabled={it.quantity <= 1 || update.isPending} className="cursor-pointer px-2 py-1 text-gray-500 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
                                                <span className="w-8 text-center text-sm">{it.quantity}</span>
                                                <button onClick={() => update.mutate({ id: it.id, quantity: it.quantity + 1 })} disabled={it.quantity >= it.stock || update.isPending} className="cursor-pointer px-2 py-1 text-gray-500 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                                            </div>
                                            <button onClick={() => remove.mutate(it.id)} className="cursor-pointer rounded p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                        {it.quantity >= it.stock && <p className="mt-1 text-[11px] text-amber-600">Đã đạt tồn tối đa ({it.stock})</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {data && data.items.length > 0 && (
                    <div className="border-t border-gray-100 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tạm tính</span>
                            <span className="text-lg font-bold text-gray-900">{formatVnd(data.subtotal)}</span>
                        </div>
                        <Link href="/checkout" onClick={() => setOpen(false)} className="block rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
                            Thanh toán
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}