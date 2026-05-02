import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth/context';
import { Providers } from '@/lib/query-client';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'KEDevs Connect — Kenya Developer Community',
  description:
    'Connect with top Kenyan developers and employers. Find jobs, showcase your skills, and grow your tech career.',
  keywords: ['Kenya developers', 'tech jobs Kenya', 'developer community', 'KEDevs'],
  openGraph: {
    title: 'KEDevs Connect',
    description: 'The premier platform for Kenyan developers and tech employers.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <Providers>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
