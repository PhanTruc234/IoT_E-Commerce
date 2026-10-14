import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Đăng ký' };

export default function RegisterPage() {
    return (
        <div>
            <h1 className="text-center text-2xl font-semibold text-slate-900">Tạo tài khoản</h1>
            <p className="mt-1.5 mb-7 text-center text-sm text-balance text-slate-500">Đăng ký để đặt hàng và tra cứu bảo hành.</p>
            <RegisterForm />
            <p className="mt-8 text-center text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập</Link>
            </p>
        </div>
    );
}
