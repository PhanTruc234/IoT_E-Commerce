'use client';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';
import { useRegister } from '../hooks/use-register';
import { getApiErrorMessage, getRetryAfter } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { AuthInput } from './auth-input';
import { AuthAlert } from './auth-alert';
import { LegalConsentModal } from './legal-consent-modal';

// Trùng với điều kiện trong registerSchema, hiện ra để khách biết còn thiếu gì khi đang gõ
const PASSWORD_RULES = [
    { label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
    { label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Có chữ thường', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Có ký tự đặc biệt', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';
const errorCls = 'mt-1.5 text-xs text-red-600';

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    });
    const password = useWatch({ control, name: 'password' }) ?? '';
    const registerMutation = useRegister();
    const [pending, setPending] = useState<RegisterInput | null>(null);
    const [blocked, setBlocked] = useState(false);

    return (
        <>
            <form onSubmit={handleSubmit((v) => setPending(v))} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="fullName" className={labelCls}>Họ và tên</label>
                    <AuthInput id="fullName" icon={User} autoComplete="name" placeholder="Nguyễn Văn A"
                        aria-invalid={!!errors.fullName} {...register('fullName')} />
                    {errors.fullName && <p className={errorCls}>{errors.fullName.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className={labelCls}>Email</label>
                    <AuthInput id="email" icon={Mail} type="email" autoComplete="email" placeholder="ban@example.com"
                        aria-invalid={!!errors.email} {...register('email')} />
                    {errors.email && <p className={errorCls}>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className={labelCls}>
                        Số điện thoại <span className="font-normal text-slate-400">(tuỳ chọn)</span>
                    </label>
                    <AuthInput id="phone" icon={Phone} type="tel" autoComplete="tel" placeholder="0912345678"
                        aria-invalid={!!errors.phone} {...register('phone')} />
                    {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className={labelCls}>Mật khẩu</label>
                    <AuthInput id="password" icon={Lock} type="password" autoComplete="new-password" placeholder="Tạo mật khẩu"
                        aria-invalid={!!errors.password} aria-describedby="password-rules" {...register('password')} />
                    <ul id="password-rules" className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {PASSWORD_RULES.map((r) => {
                            const ok = r.test(password);
                            return (
                                <li key={r.label} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-green-600' : 'text-slate-400'}`}>
                                    <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${ok ? 'bg-green-600 text-white' : 'border border-slate-300'}`}>
                                        {ok && <Check aria-hidden className="h-2.5 w-2.5" strokeWidth={3.5} />}
                                    </span>
                                    {r.label}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className={labelCls}>Xác nhận mật khẩu</label>
                    <AuthInput id="confirmPassword" icon={Lock} type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu"
                        aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
                    {errors.confirmPassword && <p className={errorCls}>{errors.confirmPassword.message}</p>}
                </div>

                {registerMutation.isError && <AuthAlert message={getApiErrorMessage(registerMutation.error)} locked={blocked} />}

                <Button type="submit" className="h-11 w-full" disabled={registerMutation.isPending || blocked}>
                    {registerMutation.isPending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
                    {registerMutation.isPending ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
                </Button>
            </form>
            {pending && (
                <LegalConsentModal
                    loading={registerMutation.isPending}
                    onCancel={() => setPending(null)}
                    onAgree={() =>
                        registerMutation.mutate({ ...pending, acceptTerms: true }, {
                            onError: (e) => {
                                setPending(null);
                                // BE báo bị chặn bao nhiêu giây → khoá nút đúng khoảng đó, hết thì mở lại và ẩn thông báo
                                const seconds = getRetryAfter(e);
                                if (seconds > 0) {
                                    setBlocked(true);
                                    setTimeout(() => { setBlocked(false); registerMutation.reset(); }, seconds * 1000);
                                }
                            },
                        })
                    }
                />
            )}
        </>
    );
}
