import { Header } from '@/shared/components/layout/header';
import { Footer } from '@/shared/components/layout/footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}