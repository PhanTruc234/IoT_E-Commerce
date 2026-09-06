'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useLogin } from '../hooks/use-login';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });
    const login = useLogin();

    return (
        <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input id="email" type="email" autoComplete="email" placeholder="ban@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {login.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{getApiErrorMessage(login.error)}</p>
            )}

            <Button type="submit" disabled={login.isPending}>
                {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </Button>
        </form>
    );
}