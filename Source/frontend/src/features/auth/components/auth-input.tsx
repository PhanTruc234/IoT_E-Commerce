'use client';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

type Props = InputHTMLAttributes<HTMLInputElement> & { icon: LucideIcon };

export const AuthInput = forwardRef<HTMLInputElement, Props>(function AuthInput(
    { icon: Icon, type = 'text', className = '', ...props },
    ref,
) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative">
            <Icon aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                ref={ref}
                type={isPassword && show ? 'text' : type}
                className={`h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/15 disabled:opacity-60 ${isPassword ? 'pr-11' : 'pr-3.5'} ${className}`}
                {...props}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={show}
                    className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
});
