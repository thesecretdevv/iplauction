import { Suspense } from 'react';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css';
import { GameProvider } from './GameContext';

export const metadata = {
  title: 'IPL Auction Online | Real-Time Cricket Auction Simulator',
  description: 'Experience the thrill of a live cricket auction at iplauction.fun. Join multiplayer rooms, bid on top players, manage your franchise purse, and build the ultimate dream squad. Play the most realistic IPL auction simulator online.',
  keywords: ['IPL Auction', 'IPL Auction Online', 'IPL Auction Simulator', 'Cricket Auction Game', 'Multiplayer Cricket Game', 'iplauction.fun', 'Fantasy Cricket Strategy', 'IPL 2025 Auction'],
  metadataBase: new URL('https://iplauction.fun'),
  openGraph: {
    title: 'IPL Auction Online - The Ultimate Simulator',
    description: 'The closest experience to a real-world IPL auction. Bid, strategize, and build your franchise at iplauction.fun.',
    url: 'https://iplauction.fun',
    siteName: 'IPL Auction Online',
    images: [
      {
        url: '/assets/favicon.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPL Auction Online | Live Cricket Auction Simulator',
    description: 'Experience the thrill of a live IPL auction. Join multiplayer rooms and build your dream franchise at iplauction.fun!',
    images: ['/assets/og-image.png'],
  },
  icons: {
    icon: '/assets/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K3B8D7K8YY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-K3B8D7K8YY');
          `}
        </Script>
      </head>
      <body>
        <GameProvider>{children}</GameProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
