import type { Metadata, Viewport } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import AmbientBackground from '@/components/layout/AmbientBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { VaultProvider } from '@/components/layout/VaultGate';

// Inter via system stack fallback (no webfont fetch at build —
// add <link> to fonts.googleapis.com in production if desired).
// --font-inter is referenced in CSS with system-ui fallbacks.

export const metadata: Metadata = {
  title: {
    default: 'Ahmed Yasser — Knowledge Vault & Blog',
    template: '%s · Ahmed Yasser',
  },
  description: 'A personal knowledge vault with a public face — notes on AI, algorithms, and building.',
};

export const viewport: Viewport = {
  themeColor: '#050506',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmbientBackground />
        <VaultProvider>
          <Navbar />
          {children}
          <Footer />
        </VaultProvider>
      </body>
    </html>
  );
}
