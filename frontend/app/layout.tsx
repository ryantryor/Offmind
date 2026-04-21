import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OffMind — Offline Private Knowledge Search',
  description:
    'Drop in your docs. Search them like magic, fully offline. Powered by Actian VectorAI DB.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
