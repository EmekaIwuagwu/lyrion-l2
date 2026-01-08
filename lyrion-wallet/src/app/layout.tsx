import type { Metadata } from 'next';
import { Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: 'Lyrion Wallet',
  description: 'The Premium L2 Wallet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}>
        <WalletProvider>
          {/* Liquid Background */}
          <div className="liquid-bg">
            <div className="liquid-blob blob-1"></div>
            <div className="liquid-blob blob-2"></div>
            <div className="liquid-blob blob-3"></div>
          </div>

          <div className="relative z-10 w-full min-h-screen">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
