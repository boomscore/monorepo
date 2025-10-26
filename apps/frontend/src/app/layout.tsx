import type { Metadata } from 'next';
import { Onest, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '@/lib/apollo';
import { Navbar } from '@/components';
import { Toaster } from 'sonner';

const geistSans = Onest({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Boomscore',
  description: 'Ai sports prediction platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ApolloProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" richColors />
        </ApolloProvider>
      </body>
    </html>
  );
}
