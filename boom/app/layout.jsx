import { Suspense } from 'react';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css';
import { GameProvider } from './GameContext';

export const metadata = {
  title: 'IPL Auction Online Game | Live Cricket Auction Simulator',
  description: 'Play IPL Auction Online, the live cricket auction game with private rooms, real-time bidding, franchise purse strategy, and dream squad building.',
  keywords: ['ipl auction game', 'ipl auction online', 'cricket auction online', 'ipl online game', 'auction online', 'live auction rooms', 'ipl room code'],
  metadataBase: new URL('https://iplauction.fun'),
  alternates: {
    canonical: 'https://iplauction.fun',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'IPL Auction Online Game | Play Live Cricket Auction Online',
    description: 'Create a room, join friends, bid on players in real time, and build your IPL franchise in this live cricket auction game.',
    url: 'https://iplauction.fun',
    siteName: 'IPL Auction Online',
    images: [
      {
        url: '/assets/Hero_players.png',
        width: 1200,
        height: 669,
        alt: 'IPL Auction Online hero artwork',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPL Auction Online Game | Live Cricket Auction Simulator',
    description: 'Join live cricket auction rooms, bid in real time, and build your IPL squad online.',
    images: ['/assets/Hero_players.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Courier+Prime:wght@400;700&family=Montserrat:wght@700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Courier+Prime:wght@400;700&family=Montserrat:wght@700&display=swap"
        />
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
