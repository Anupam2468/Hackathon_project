import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import HelpGuide from './components/HelpGuide';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'FastLIFE | Blood Donation System',
  description: 'Connect with donors, hospitals and recipients in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <HelpGuide />
      </body>
    </html>
  );
}
