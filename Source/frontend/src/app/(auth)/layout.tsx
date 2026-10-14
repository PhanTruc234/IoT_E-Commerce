import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/IoTechNew.png';
import authBg from '../../../public/auth-bg.webp';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
            {/* Ảnh nền cố định toàn màn hình; trang đăng ký dài thì cuộn form, nền đứng yên */}
            <div aria-hidden className="fixed inset-0 -z-10">
                <Image src={authBg} alt="" fill priority placeholder="blur" sizes="100vw" className="object-cover" />
            </div>

            <main className="w-full max-w-[440px] rounded-2xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur-md sm:p-8">
                <Link href="/" className="mb-6 flex justify-center">
                    <Image src={logo} alt="IoTech – về trang chủ" priority className="h-16 w-auto mix-blend-multiply" />
                </Link>
                {children}
            </main>
        </div>
    );
}
