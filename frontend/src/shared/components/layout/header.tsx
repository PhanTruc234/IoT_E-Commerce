import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { CATEGORIES } from '@/shared/config/navigation';
import { UserNav } from '@/features/auth/components/user-nav';
import { SearchBar } from './search-bar';
import { MobileMenu } from './mobile-menu';

export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4">
                <MobileMenu />

                <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-gray-900">
                    TMĐT<span className="text-blue-600">IoT</span>
                </Link>

                <div className="hidden flex-1 md:block">
                    <SearchBar />
                </div>

                <nav className="ml-auto flex items-center gap-1 sm:gap-2">
                    <Link
                        href="/favorites"
                        aria-label="Yêu thích"
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
                    >
                        <Heart className="h-5 w-5" />
                    </Link>
                    <Link
                        href="/cart"
                        aria-label="Giỏ hàng"
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </Link>
                    <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
                    <UserNav />
                </nav>
            </div>
            <div className="hidden border-t border-gray-100 md:block">
                <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
                    {CATEGORIES.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/products?category=${c.slug}`}
                            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm text-gray-600 transition hover:text-blue-600"
                        >
                            <c.icon className="h-4 w-4" />
                            {c.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-2 md:hidden">
                <SearchBar />
            </div>
        </header>
    );
}