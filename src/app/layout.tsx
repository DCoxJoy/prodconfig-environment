import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'aXtion Configurator — Joy Factory',
  description: 'Find the right aXtion case, mount, and accessories for your device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
