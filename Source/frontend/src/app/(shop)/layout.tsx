import { Header } from '@/shared/components/layout/header';
import { Footer } from '@/shared/components/layout/footer';
import { CompareBar } from '@/features/products/components/compare-bar';
import { CartDrawer } from '@/features/cart/components/cart-drawer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareBar />
            <CartDrawer />
        </div>
    );
}