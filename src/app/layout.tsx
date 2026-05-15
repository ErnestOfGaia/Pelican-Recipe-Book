import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata: Metadata = {
  title: 'Pellito Hub',
  description: 'Kitchen training for Pelican Brewery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
