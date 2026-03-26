import { Suspense } from 'react';
import './globals.css';
import { GameProvider } from './GameContext';

export const metadata = {
  title: 'Gavel — IPL Auction Platform',
  description: 'Strike your bid. 10 franchises. 204 players. One night.',
  icons: {
    icon: '/assets/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
