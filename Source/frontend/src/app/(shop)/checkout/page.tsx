'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Truck, Wallet } from 'lucide-react';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { formatVnd } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useCreateOrder } from '@/features/orders/hooks/use-orders';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PolicyModal } from '@/features/legal/components/policy-modal';

const schema = z.object({
    recipientName: z.string().min(2, 'Nhập họ tên').max(100),
    phone: z.string().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ'),
    address: z.string().min(5, 'Nhập địa chỉ').max(255),
    note: z.string().max(500).optional(),
    paymentMethod: z.enum(['COD', 'VNPAY']),
});
type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const authStatus = useAuthStore((s) => s.status);

    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const { data: cart, isLoading } = useCart();
    const create = useCreateOrder();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { recipientName: '', phone: '', address: '', note: '', paymentMethod: 'COD' },
    });
    const method = watch('paymentMethod');

    useEffect(() => {
        if (authStatus === 'unauthenticated') router.replace('/login');
    }, [authStatus, router]);
    useEffect(() => {
        if (user) {
            setValue('recipientName', user.fullName ?? '');
            if (user.phone) setValue('phone', user.phone);
            if (user.address) setValue('address', user.address);
        }
    }, [user, setValue]);

    const onSubmit = (v: FormValues) => {
        create.mutate(v, {
            onSuccess: ({ order, paymentUrl }) => {
                if (paymentUrl) window.location.href = paymentUrl;
                else router.push(`/orders/${order.id}`);
            },
        });
    };

    if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-400">Đang tải…</div>;
    if (!cart || cart.items.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-center">
                <p className="text-sm text-gray-500">Giỏ hàng trống.</p>
                <Link href="/products" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Mua sắm ngay →</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Thanh toán</h1>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                            <Truck className="h-5 w-5 text-blue-600" /> Thông tin giao hàng</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Họ và tên" error={errors.recipientName?.message}>
                                <Input {...register('recipientName')} placeholder="Nguyễn Văn A" />
                            </Field>
                            <Field label="Số điện thoại" error={errors.phone?.message}>
                                <Input {...register('phone')} placeholder="0901234567" />
                            </Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Địa chỉ nhận hàng" error={errors.address?.message}>
                                <Input {...register('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" />
                            </Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Ghi chú (tuỳ chọn)">
                                <textarea {...register('note')} rows={3} placeholder="Ghi chú cho người giao hàng…"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </Field>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                            <Wallet className="h-5 w-5 text-blue-600" /> Phương thức thanh toán</h2>
                        <div className="space-y-2">
                            {([
                                { v: 'COD', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận' },
                                { v: 'VNPAY', label: 'VNPAY', desc: 'Thẻ/QR qua cổng VNPAY' },
                            ] as const).map((m) => (
                                <label key={m.v} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${method === m.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" value={m.v} {...register('paymentMethod')} className="mt-1" />
                                    <span>
                                        <span className="block text-sm font-medium text-gray-800">{m.label}</span>
                                        <span className="block text-xs text-gray-500">{m.desc}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 font-semibold text-gray-900">Đơn hàng ({cart.itemCount})</h2>
                        <ul className="max-h-64 space-y-3 overflow-y-auto">
                            {cart.items.map((it) => (
                                <li key={it.id} className="flex gap-3">
                                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                                        {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-1 text-sm text-gray-800">{it.name}</span>
                                        {it.variantLabel && <span className="block text-xs text-indigo-600">{it.variantLabel}</span>}
                                        <span className="text-xs text-gray-500">{it.quantity} × {formatVnd(it.unitPrice)}</span>
                                    </span>
                                    <span className="shrink-0 text-sm font-medium text-gray-700">{formatVnd(it.lineTotal)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVnd(cart.subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{cart.subtotal >= 500000 ? 'Miễn phí' : formatVnd(30000)}</span></div>
                            <div className="flex justify-between pt-1 text-base font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span className="text-blue-600">{formatVnd(cart.subtotal + (cart.subtotal >= 500000 ? 0 : 30000))}</span>
                            </div>
                        </div>
                        <label className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
                            <span>
                                Tôi đồng ý với{' '}
                                <button type="button" onClick={() => setShowTerms(true)} className="cursor-pointer font-medium text-blue-600 hover:underline">Điều khoản mua hàng</button>
                            </span>
                        </label>
                        <button type="submit" disabled={create.isPending || !agreed}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {method === 'VNPAY' ? 'Thanh toán VNPAY' : 'Đặt hàng'}
                        </button>
                        {create.isError && <p className="mt-2 text-sm text-red-600">{getApiErrorMessage(create.error)}</p>}
                    </div>
                </aside>
            </div>
            {showTerms && <PolicyModal slug="purchase" onClose={() => setShowTerms(false)} />}
        </form>
    );
}