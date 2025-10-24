import type { Metadata } from 'next';
import '../globals.css';
import { Inter } from 'next/font/google';
import { GTMConsentClient } from '@/components/GTMConsentClient';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Erfolgreich angemeldet | Gedenkseiten.ai',
  description: 'Deine Anmeldung bei Gedenkseiten.ai war erfolgreich. Wir freuen uns, dass du dabei bist.',
};

export default function ConfirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-primary text-bw">
        {children}
        <GTMConsentClient />
      </body>
    </html>
  );
} 