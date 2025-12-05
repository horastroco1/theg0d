import type { Metadata, Viewport } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const vazirmatn = Vazirmatn({ subsets: ['arabic'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'theg0d | Cyber-Vedic AI Oracle',
  description: 'Decrypt your destiny with theg0d. The world\'s first Cyber-Vedic AI astrologer. Encrypted. Precise. Divine.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'theg0d',
  },
  openGraph: {
    title: 'theg0d | Cyber-Vedic AI Oracle',
    description: 'Your fate is source code. Decrypt it now.',
    url: 'https://theg0d.com',
    siteName: 'theg0d',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'theg0d interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'theg0d',
    description: 'Cyber-Vedic Intelligence Protocol.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/icon-512x512.png',
    shortcut: '/icon-512x512.png',
    apple: '/icon-512x512.png',
  },
  other: {
    'cache-control': 'no-store, max-age=0', // Force Cache Bust
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white overflow-hidden overscroll-none`}>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-vazir: ${vazirmatn.style.fontFamily};
            }
          `
        }} />
        <div className="noise-overlay pointer-events-none fixed inset-0 z-[100] opacity-[0.03] mix-blend-overlay"></div>
        {children}
      </body>
    </html>
  );
}
