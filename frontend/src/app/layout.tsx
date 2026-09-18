import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { env } from '@/shared/config/env';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const DESCRIPTION = 'Cửa hàng thiết bị IoT, module, cảm biến, Arduino/ESP32 và linh kiện điện tử chính hãng — bảo hành theo serial, giao hàng toàn quốc.';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'IoTech — Thiết bị & linh kiện điện tử',
    template: '%s | IoTech',
  },
  description: DESCRIPTION,
  keywords: ['IoT', 'ESP32', 'Arduino', 'Raspberry Pi', 'cảm biến', 'linh kiện điện tử', 'module', 'IoTech'],
  applicationName: 'IoTech',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'IoTech',
    locale: 'vi_VN',
    url: env.siteUrl,
    title: 'IoTech — Thiết bị & linh kiện điện tử',
    description: DESCRIPTION,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IoTech — Thiết bị & linh kiện điện tử',
    description: DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}