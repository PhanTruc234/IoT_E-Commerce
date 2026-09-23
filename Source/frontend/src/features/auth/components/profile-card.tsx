'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Phone, MapPin, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAuthStore } from '../store/auth.store';
import { useUpdateProfile } from '../hooks/use-profile';

const schema = z.object({
    fullName: z.string().min(2, 'Nhập họ tên').max(100),
    phone: z.string().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ').or(z.literal('')),
    address: z.string().max(255).optional(),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70';

const roleLabel = (role?: string) => (role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng');

function IconField({
    label,
    required,
    error,
    hint,
    icon,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                {children}
            </div>
            {error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : hint ? (
                <p className="mt-1 text-xs text-gray-400">{hint}</p>
            ) : null}
        </div>
    );
}

export function ProfileCard() {
    const user = useAuthStore((s) => s.user);
    const update = useUpdateProfile();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: '', phone: '', address: '' },
    });

    useEffect(() => {
        if (user) reset({ fullName: user.fullName ?? '', phone: user.phone ?? '', address: user.address ?? '' });
    }, [user, reset]);

    const onSubmit = (v: FormValues) => {
        update.mutate({ fullName: v.fullName, phone: v.phone || undefined, address: v.address || undefined });
    };

    const resetToUser = () => {
        if (user) reset({ fullName: user.fullName ?? '', phone: user.phone ?? '', address: user.address ?? '' });
    };

    const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?';

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-linear-to-r from-blue-50 to-teal-50 p-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-sm">
                    {initial}
                </span>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold text-gray-900">{user?.fullName ?? '—'}</h3>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {roleLabel(user?.role)}
                        </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail className="h-4 w-4" /> {user?.email}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                        <UserIcon className="h-5 w-5 text-blue-600" /> Chỉnh sửa thông tin
                    </h3>
                    <span className="text-xs text-gray-400">
                        Các trường có dấu <span className="text-red-500">*</span> là bắt buộc
                    </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <IconField label="Họ và tên" required error={errors.fullName?.message} icon={<UserIcon className="h-4 w-4" />}>
                        <input {...register('fullName')} placeholder="Nguyễn Văn A" className={inputCls} />
                    </IconField>
                    <IconField label="Email" required icon={<Mail className="h-4 w-4" />} hint="Email dùng để đăng nhập, không thể thay đổi">
                        <input value={user?.email ?? ''} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
                    </IconField>
                    <IconField label="Số điện thoại" error={errors.phone?.message} icon={<Phone className="h-4 w-4" />} hint="Dùng để liên hệ khi cần thiết">
                        <input {...register('phone')} placeholder="0901234567" className={inputCls} />
                    </IconField>
                    <IconField label="Địa chỉ nhận hàng" error={errors.address?.message} icon={<MapPin className="h-4 w-4" />} hint="Địa chỉ sẽ được dùng làm mặc định khi đặt hàng">
                        <input {...register('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" className={inputCls} />
                    </IconField>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                    {update.isSuccess && <span className="mr-auto text-sm text-green-600">Đã lưu thay đổi.</span>}
                    {update.isError && <span className="mr-auto text-sm text-red-600">{getApiErrorMessage(update.error)}</span>}
                    <Button type="button" variant="secondary" onClick={resetToUser} disabled={!isDirty || update.isPending}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={update.isPending}>
                        <Save className="h-4 w-4" />
                        {update.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
