'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Mail } from 'lucide-react';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useLogin } from '../hooks/use-login';
import { getApiErrorMessage, getRetryAfter } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { AuthInput } from './auth-input';
import { AuthAlert } from './auth-alert';
import { GoogleLoginButton } from './google-login-button';

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
    const [blocked, setBlocked] = useState(false);

    const onSubmit = (v: LoginInput) =>
        login.mutate(v, {
            onError: (e) => {
                const seconds = getRetryAfter(e);
                if (seconds > 0) {
                    setBlocked(true);
                    setTimeout(() => { setBlocked(false); login.reset(); }, seconds * 1000);
                }
            },
        });

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <AuthInput id="email" icon={Mail} type="email" autoComplete="email" placeholder="ban@example.com"
                        aria-invalid={!!errors.email} {...register('email')} />
                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</label>
                    <AuthInput id="password" icon={Lock} type="password" autoComplete="current-password" placeholder="Nhập mật khẩu"
                        aria-invalid={!!errors.password} {...register('password')} />
                    {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                {login.isError && <AuthAlert message={getApiErrorMessage(login.error)} locked={blocked} />}

                <Button type="submit" className="h-11 w-full" disabled={login.isPending || blocked}>
                    {login.isPending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
                    {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" /> hoặc <span className="h-px flex-1 bg-slate-200" />
            </div>
            <GoogleLoginButton />
        </>
    );
}
