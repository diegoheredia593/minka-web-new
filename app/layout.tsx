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
      description: 'Administración de residentes, reservas, cobranzas y comunicación para comunidades residenciales.',
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
    default: 'Minka - Tu comunidad, mejor organizada',
    template: '%s | Minka',
  },
  description:
    'Minka administra residentes, reservas, cobranzas y comunicación para comunidades residenciales en Ecuador.',
  keywords: ['administración de condominios', 'urbanizaciones', 'reservas', 'cobranzas', 'comunidades residenciales', 'Ecuador'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: '/',
    siteName: 'Minka',
    title: 'Minka - Tu comunidad, mejor organizada',
    description: 'Administración clara para residentes, reservas, cobranzas y comunicación.',
  },
  twitter: {
    card: 'summary',
    title: 'Minka - Tu comunidad, mejor organizada',
    description: 'Administración clara para comunidades residenciales en Ecuador.',
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
