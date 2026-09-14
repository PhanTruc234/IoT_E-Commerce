import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-8 flex justify-center">
                    <Image src="/logo.png" alt="IoTech" width={160} height={56} priority className="h-14 w-auto object-contain" />
                </Link>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
            </div>
        </div>
    );
}