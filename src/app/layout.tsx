import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

// Shared GA4 property across every version of the app (default + all partner
// routes) — events carry an `app_version` param (see lib/analytics.ts) so each
// version can be filtered separately in reporting without needing its own property.
const GA_MEASUREMENT_ID = 'G-2NYWBB5T4Q';

export const metadata: Metadata = {
  title: 'aXtion Configurator — Joy Factory',
  description: 'Find the right aXtion case, mount, and accessories for your device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
