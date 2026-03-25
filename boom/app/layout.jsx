import { Suspense } from 'react';
import './globals.css';
import { GameProvider } from './GameContext';

export const metadata = {
  title: 'BidWicket - IPL Auction',
  description: 'The Ultimate IPL Bidding Simulation',
  icons: {
    icon: '/assets/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GameProvider>{children}</GameProvider>
        </Suspense>
      </body>
    </html>
  );
}
