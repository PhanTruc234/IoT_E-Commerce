'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';
import { useRegister } from '../hooks/use-register';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    });
    const registerMutation = useRegister();

    return (
        <form onSubmit={handleSubmit((v) => registerMutation.mutate(v))} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Họ và tên</label>
                <Input id="fullName" autoComplete="name" placeholder="Nguyễn Văn A" {...register('fullName')} />
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input id="email" type="email" autoComplete="email" placeholder="ban@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại <span className="text-gray-400">(tùy chọn)</span></label>
                <Input id="phone" type="tel" autoComplete="tel" placeholder="0912345678" {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" {...register('password')} />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {registerMutation.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(registerMutation.error)}</p>
            )}

            <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
            </Button>
        </form>
    );
}