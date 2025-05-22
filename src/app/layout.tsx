import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { CookieBanner } from '@/components/CookieBanner';
import { MainFooter } from '@/components/layout/MainFooter';
import { GTMConsentClient } from '@/components/GTMConsentClient';
import { 
  faqSchema, 
  breadcrumbSchema, 
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  webpageSchema 
} from './structured-data';
// import ThemeProviderClient from './ThemeProviderClient';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Gedenkseiten.ai - Digitale Erinnerungsstücke | Online Gedenkseiten erstellen',
  description: 'Erstelle eine würdevolle digitale Gedenkseite für deine verstorbenen Liebsten. Egal ob Mensch oder Tier. Einfach, persönlich und online sonlange du willst.',
  keywords: 'Gedenkseite, digitale Gedenkseite, Trauer, Erinnerung, Online Gedenkseite, Kondolenzbuch, digitale Erinnerung, death-tech, KI-Gedenkseiten',
  openGraph: {
    title: 'Gedenkseiten.ai - Digitale Erinnerungsstücke',
    description: 'Erstelle eine würdevolle digitale Gedenkseite für deine verstorbenen Liebsten.',
    url: 'https://gedenkseiten.ai',
    siteName: 'Gedenkseiten.ai',
    images: [
      {
        url: 'https://gedenkseiten.ai/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gedenkseiten.ai - Digitale Erinnerungsstücke'
      }
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gedenkseiten.ai - Digitale Erinnerungsstücke',
    description: 'Erstelle eine würdevolle digitale Gedenkseite für deine verstorbenen Liebsten.',
    images: ['https://gedenkseiten.ai/images/x-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'dOKxXxVN478RDsBOu9zBccg3uhRbgNuhh0WmNuF8EQU',
  },
  authors: [{ name: 'Gedenkseiten.ai' }],
  creator: 'Gedenkseiten.ai',
  publisher: 'Gedenkseiten.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                organizationSchema,
                websiteSchema,
                localBusinessSchema,
                faqSchema,
                breadcrumbSchema,
                webpageSchema,
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background-primary text-foreground-primary flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <MainFooter />
        <CookieBanner />
        <GTMConsentClient />
      </body>
    </html>
  );
}
