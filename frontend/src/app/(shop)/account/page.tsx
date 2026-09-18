'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircle } from 'lucide-react';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUpdateProfile } from '@/features/auth/hooks/use-profile';

const schema = z.object({
    fullName: z.string().min(2, 'Nhập họ tên').max(100),
    phone: z.string().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ').or(z.literal('')),
    address: z.string().max(255).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AccountPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);
    const update = useUpdateProfile();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: '', phone: '', address: '' },
    });

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login');
    }, [status, router]);

    useEffect(() => {
        if (user) {
            reset({ fullName: user.fullName ?? '', phone: user.phone ?? '', address: user.address ?? '' });
        }
    }, [user, reset]);

    const onSubmit = (v: FormValues) => {
        update.mutate({
            fullName: v.fullName,
            phone: v.phone || undefined,
            address: v.address || undefined,
        });
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <UserCircle className="h-6 w-6 text-blue-600" /> Thông tin cá nhân
            </h1>
            <p className="mb-6 text-sm text-gray-500">Thông tin này sẽ được dùng sẵn khi bạn đặt hàng.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                <Field label="Email">
                    <Input value={user?.email ?? ''} disabled className="bg-gray-50" />
                </Field>
                <Field label="Họ và tên" error={errors.fullName?.message}>
                    <Input {...register('fullName')} placeholder="Nguyễn Văn A" />
                </Field>
                <Field label="Số điện thoại" error={errors.phone?.message}>
                    <Input {...register('phone')} placeholder="0901234567" />
                </Field>
                <Field label="Địa chỉ nhận hàng" error={errors.address?.message}>
                    <Input {...register('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" />
                </Field>

                <div className="flex items-center justify-end gap-3">
                    {update.isSuccess && <span className="text-sm text-green-600">Đã lưu.</span>}
                    {update.isError && <span className="text-sm text-red-600">{getApiErrorMessage(update.error)}</span>}
                    <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}</Button>
                </div>
            </form>
        </div>
    );
}
