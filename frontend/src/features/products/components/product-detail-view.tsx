'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Boxes, Check, ChevronRight, CreditCard, ImageIcon, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { formatVnd } from '@/shared/lib/format';
import { useComboItems } from '../hooks/use-combo-items';
import type { PublicProductDetail } from '../types';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useCartUI } from '@/features/cart/store/cart-ui.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useRouter } from 'next/navigation';
import { usePublicProducts } from '../hooks/use-storefront';
import { ProductCard } from './product-card';
import { ProductQuestions } from '@/features/questions/components/product-questions';
import { ProductReviews } from '@/features/reviews/components/product-reviews';
import { track } from '@/features/analytics/api/events.api';

export function ProductDetailView({ product }: { product: PublicProductDetail }) {
    const isVariable = product.type === 'VARIABLE';
    const isCombo = product.type === 'COMBO';
    const variantAttrs = product.attributes.filter((a) => a.isVariant);

    const [selected, setSelected] = useState<Record<string, string>>({});
    const allSelected = variantAttrs.every((a) => selected[a.id]);

    const selectedVariant = useMemo(() => {
        if (!isVariable || !allSelected) return null;
        return (
            product.variants.find((v) =>
                variantAttrs.every((a) => {
                    const link = v.options.find((o) => o.option.attribute.id === a.id);
                    return link && link.option.id === selected[a.id];
                }),
            ) ?? null
        );
    }, [isVariable, allSelected, product.variants, variantAttrs, selected]);

    const priceRange = useMemo(() => {
        if (!isVariable || product.variants.length === 0) return null;
        const prices = product.variants.map((v) => v.salePrice ?? v.price);
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [isVariable, product.variants]);

    const [thumb, setThumb] = useState(0);
    const gallery = product.images;
    const mainImage = selectedVariant?.imageUrl ?? gallery[thumb]?.imageUrl ?? gallery[0]?.imageUrl ?? null;

    let displayPrice: number;
    let compareAt: number | null = null;
    let stock: number | null;
    if (isVariable) {
        if (selectedVariant) {
            displayPrice = selectedVariant.salePrice ?? selectedVariant.price;
            compareAt = selectedVariant.salePrice != null ? selectedVariant.price : null;
            stock = selectedVariant.stockQuantity;
        } else {
            displayPrice = priceRange?.min ?? product.price;
            stock = null;
        }
    } else {
        displayPrice = product.salePrice ?? product.price;
        compareAt = product.salePrice != null ? product.price : null;
        stock = product.stockQuantity;
    }

    const [qty, setQty] = useState(1);
    const router = useRouter();
    const add = useAddToCart();
    const openCart = useCartUI((s) => s.setOpen);
    const authStatus = useAuthStore((s) => s.status);

    const variantOOS = isVariable && !!selectedVariant && selectedVariant.stockQuantity <= 0;
    const simpleOOS = !isVariable && !isCombo && product.stockQuantity <= 0;
    const cannotAdd = (isVariable && !selectedVariant) || variantOOS || simpleOOS || add.isPending;

    const handleAdd = () => {
        if (authStatus !== 'authenticated') {
            router.push('/login');
            return;
        }
        if (cannotAdd) return;
        add.mutate(
            { productId: product.id, variantId: selectedVariant?.id, quantity: qty },
            { onSuccess: () => { track({ type: 'ADD_TO_CART', productId: product.id }); openCart(true); } },
        );
    };
    const lastTrackedProduct = useRef<string | null>(null);
    useEffect(() => {
        if (product.id && lastTrackedProduct.current !== product.id) {
            lastTrackedProduct.current = product.id;
            track({ type: 'VIEW_PRODUCT', productId: product.id });
        }
    }, [product.id]);
    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <nav className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
                {product.category && (<><ChevronRight className="h-3 w-3" /><span>{product.category.name}</span></>)}
                <ChevronRight className="h-3 w-3" /><span className="text-gray-700">{product.name}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2">
                <div>
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {mainImage ? (
                            <Image src={mainImage} alt={product.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-contain p-4" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-300"><ImageIcon className="h-12 w-12" /></div>
                        )}
                    </div>
                    {gallery.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                            {gallery.map((img, i) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setThumb(i)}
                                    className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border ${i === thumb && !selectedVariant?.imageUrl ? 'border-blue-500' : 'border-gray-200'}`}
                                >
                                    <Image src={img.imageUrl} alt="" fill sizes="64px" className="object-contain p-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    {product.brand && <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{product.brand.name}</span>}
                    <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
                    <p className="mt-1 text-xs text-gray-400">SKU: {selectedVariant?.sku ?? product.sku}</p>

                    <div className="mt-4 flex items-baseline gap-3">
                        {isVariable && !selectedVariant && priceRange && priceRange.min !== priceRange.max ? (
                            <span className="text-3xl font-bold text-blue-600">{formatVnd(priceRange.min)} – {formatVnd(priceRange.max)}</span>
                        ) : (
                            <>
                                <span className="text-3xl font-bold text-blue-600">{formatVnd(displayPrice)}</span>
                                {compareAt && <span className="text-lg text-gray-400 line-through">{formatVnd(compareAt)}</span>}
                            </>
                        )}
                    </div>

                    {isVariable && variantAttrs.map((a) => (
                        <div key={a.id} className="mt-5">
                            <p className="mb-2 text-sm font-medium text-gray-700">{a.name}</p>
                            <div className="flex flex-wrap gap-2">
                                {a.options.map((opt) => {
                                    const active = selected[a.id] === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setSelected((s) => ({ ...s, [a.id]: opt.id }))}
                                            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                                        >
                                            {active && <Check className="h-3.5 w-3.5" />}{opt.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {isVariable && allSelected && !selectedVariant && (
                        <p className="mt-3 text-sm text-red-600">Phân loại này hiện không có sẵn.</p>
                    )}

                    <div className="mt-5 text-sm">
                        {isCombo ? (
                            <ComboStock productId={product.id} />
                        ) : stock == null ? (
                            <span className="text-gray-400">Chọn phân loại để xem tồn kho</span>
                        ) : stock > 0 ? (
                            <span className="text-green-600">Còn hàng ({stock})</span>
                        ) : (
                            <span className="text-red-600">Hết hàng</span>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-gray-300">
                            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="cursor-pointer px-3 py-2 text-gray-500 hover:text-gray-800"><Minus className="h-4 w-4" /></button>
                            <span className="w-10 text-center text-sm">{qty}</span>
                            <button type="button" onClick={() => setQty((q) => q + 1)} className="cursor-pointer px-3 py-2 text-gray-500 hover:text-gray-800"><Plus className="h-4 w-4" /></button>
                        </div>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={cannotAdd}
                            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {add.isPending ? 'Đang thêm…' : isVariable && !selectedVariant ? 'Chọn phân loại' : 'Thêm vào giỏ'}
                        </button>
                    </div>
                    {add.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(add.error)}</p>}
                    <div className="mt-5 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                        <div className="flex items-center gap-2.5 text-gray-700">
                            <Truck className="h-4 w-4 shrink-0 text-blue-600" /> Miễn phí giao hàng cho đơn từ 500.000₫
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                            <CreditCard className="h-4 w-4 shrink-0 text-blue-600" /> Thanh toán khi nhận hàng (COD) hoặc VNPAY
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                            <RotateCcw className="h-4 w-4 shrink-0 text-blue-600" /> Đổi trả trong 7 ngày
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-700">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                        Bảo hành chính hãng theo số serial · <Link href="/warranty" className="text-blue-600 hover:underline">Tra cứu</Link>
                    </div>
                    <ProductReviews productId={product.id} />
                </div>
            </div>

            {isCombo && <ComboSection productId={product.id} />}

            {product.description && (
                <section className="mt-10">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Mô tả</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{product.description}</p>
                </section>
            )}

            {product.specifications.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Thông số kỹ thuật</h2>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {product.specifications.map((s) => (
                                    <tr key={s.id} className="even:bg-gray-50">
                                        <td className="w-1/3 px-4 py-2.5 font-medium text-gray-600">{s.specification.name}</td>
                                        <td className="px-4 py-2.5 text-gray-800">{s.value}{s.specification.unit ? ` ${s.specification.unit}` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <ProductQuestions productId={product.id} />
            {product.category && <RelatedProducts categoryId={product.category.id} currentId={product.id} />}
        </div>
    );
}

function ComboStock({ productId }: { productId: string }) {
    const { data } = useComboItems(productId);
    if (!data) return <span className="text-gray-400">…</span>;
    return data.availableStock > 0
        ? <span className="text-green-600">Còn hàng ({data.availableStock} combo)</span>
        : <span className="text-red-600">Hết hàng</span>;
}

function ComboSection({ productId }: { productId: string }) {
    const { data, isLoading } = useComboItems(productId);
    if (isLoading) return <section className="mt-10 text-sm text-gray-400">Đang tải combo…</section>;
    if (!data || data.items.length === 0) return null;
    return (
        <section className="mt-10">
            <div className="mb-3 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-900">Combo gồm {data.items.length} sản phẩm</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {data.items.map((it) => (
                    <Link key={it.id} href={`/products/${it.product.slug}`} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-blue-300">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            {it.product.image ? (
                                <Image src={it.product.image} alt="" fill sizes="56px" className="object-contain p-1" />
                            ) : (
                                <span className="flex h-full items-center justify-center text-gray-300"><ImageIcon className="h-5 w-5" /></span>
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-800">{it.product.name}</span>
                            {it.variantLabel && <span className="block text-xs text-indigo-600">{it.variantLabel}</span>}
                            <span className="text-xs text-gray-500">SL: {it.quantity} · {formatVnd(it.unitPrice)}</span>
                        </span>
                    </Link>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-8 rounded-xl bg-amber-50 p-4">
                <div><p className="text-xs text-gray-500">Giá mua rời</p><p className="font-semibold text-gray-500 line-through">{formatVnd(data.originalPrice)}</p></div>
                <div><p className="text-xs text-gray-500">Giá combo</p><p className="text-xl font-bold text-blue-600">{formatVnd(data.comboPrice)}</p></div>
                {data.saving > 0 && <div><p className="text-xs text-gray-500">Tiết kiệm</p><p className="font-bold text-green-600">{formatVnd(data.saving)}</p></div>}
            </div>
        </section>
    );
}

function RelatedProducts({ categoryId, currentId }: { categoryId: string; currentId: string }) {
    const { data, isLoading } = usePublicProducts({ categoryId, limit: 10, sort: 'newest' });
    const items = (data?.data ?? []).filter((p) => p.id !== currentId).slice(0, 5);
    if (isLoading || items.length === 0) return null;
    return (
        <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
    );
}