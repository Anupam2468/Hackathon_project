import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import HelpGuide from './components/HelpGuide';
import Footer from './components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'FastLIFE | Emergency Blood Coordination',
  description: 'Hospital-led blood inventory, verified donor coordination, and transparent emergency status.',
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
        <Footer />
        <HelpGuide />
      </body>
    </html>
  );
}
