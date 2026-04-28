import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sarab Sanjha Darbar — Connecting hearts through events and music',
  description: 'Official platform for Sarab Sanjha Darbar. Discover upcoming events, soul-stirring music, and stay connected with the community.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app') 
      ? 'https://www.sarabsanjhadarbar.com' 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarabsanjhadarbar.com')
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sarab Sanjha Darbar',
    description: 'Official platform for Sarab Sanjha Darbar. Discover upcoming events, soul-stirring music, and stay connected with the community.',
    url: 'https://sarabsanjhadarbar.com',
    siteName: 'Sarab Sanjha Darbar',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/thumbnail.jpg',
        width: 1200,
        height: 630,
        alt: 'Sarab Sanjha Darbar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarab Sanjha Darbar',
    description: 'Official platform for Sarab Sanjha Darbar. Discover upcoming events and music.',
    images: ['/thumbnail.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0D0D0D] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
