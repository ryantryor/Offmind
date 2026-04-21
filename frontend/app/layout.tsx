import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OffMind — Talk with your past self',
  description:
    "A private time machine for your mind. Write, search, and converse with everything you've ever written — 100% offline. Powered by Actian VectorAI DB.",
};

// Fonts are loaded at RUNTIME from a CDN (jsDelivr, which is reachable in
// restricted networks). We avoid next/font/google because it fetches the
// font files during `next build`, which fails in offline / China-mirrored
// environments. If the CDN is unreachable, we fall back cleanly to system
// serif + system sans (see tailwind.config.ts).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fraunces — expressive serif for journal bodies + hero.
            Inter — rock-solid UI sans. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
