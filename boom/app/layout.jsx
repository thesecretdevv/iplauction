import { Suspense } from 'react';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css';
import { GameProvider } from './GameContext';
import ClickSpark from './components/ClickSpark';
import ChaiSupport from './components/ChaiSupport';
import { createMetadata, SITE_URL } from './lib/seo';

export const metadata = {
  ...createMetadata({
    title: 'IPL Auction Simulator - Play IPL Mega Auction Online with Friends',
    description: 'Play a free IPL Auction Simulator online with friends. Create mock IPL auction rooms, bid in real time, manage your purse, and build a fantasy IPL squad.',
    path: '/',
  }),
  metadataBase: new URL(SITE_URL),
  applicationName: 'IPL Auction Simulator',
  appleWebApp: {
    capable: true,
    title: 'IPL Auction Simulator',
    statusBarStyle: 'black-translucent',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/assets/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/assets/favicon.png',
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
        <meta name="google-adsense-account" content="ca-pub-2556312199314107" />
        <link rel="dns-prefetch" href="https://images.icc-cricket.com" />
        <link rel="dns-prefetch" href="https://documents.iplt20.com" />
        <link rel="preload" as="image" href="/assets/Hero_players.png" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Courier+Prime:wght@400;700&family=Montserrat:wght@700&family=Orbitron:wght@600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Courier+Prime:wght@400;700&family=Montserrat:wght@700&family=Orbitron:wght@600;700;800&display=swap"
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K3B8D7K8YY"
          strategy="afterInteractive"
        />
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2556312199314107"
          crossOrigin="anonymous"
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
        <ClickSpark
          sparkColor="#E8B84B"
          sparkSize={12}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <GameProvider>{children}</GameProvider>
        </ClickSpark>
        <ChaiSupport />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
