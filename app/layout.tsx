import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const measurementId = 'G-19BY98T7HT';
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Minka',
      url: 'https://appminka.com',
      logo: 'https://appminka.com/brand/minka-icon-180.png',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minka',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Android',
      url: 'https://appminka.com',
      description: 'Software para administrar urbanizaciones, condominios y edificios en Ecuador: residentes, reservas, cobranzas y comunicación.',
    },
  ],
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://appminka.com'),
  title: {
    default: 'Minka | Software para administrar urbanizaciones en Ecuador',
    template: '%s | Minka',
  },
  description:
    'Software para administrar urbanizaciones, condominios y edificios en Ecuador. Centraliza residentes, reservas, cobranzas y comunicación.',
  keywords: ['software para urbanizaciones', 'administración de urbanizaciones', 'administración de condominios', 'software para condominios', 'administración de edificios', 'reservas', 'cobranzas', 'comunidades residenciales', 'Ecuador'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: '/',
    siteName: 'Minka',
    title: 'Minka | Administra tu urbanización sin caos',
    description: 'Software para urbanizaciones, condominios y edificios en Ecuador.',
  },
  twitter: {
    card: 'summary',
    title: 'Minka | Administra tu urbanización sin caos',
    description: 'Software para comunidades residenciales en Ecuador.',
  },
  icons: {
    icon: '/brand/minka-icon.svg',
    apple: '/brand/minka-icon-180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
        </Script>
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      </body>
    </html>
  );
}
