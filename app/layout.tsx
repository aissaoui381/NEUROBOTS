import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neurobots.io — AI That Answers When You Can\'t',
  description: 'The AI assistant that captures leads, qualifies them, and texts you instantly — so you never miss a job again.',
  keywords: ['contractor AI', 'lead capture', 'roofing leads', 'HVAC leads', 'AI chatbot'],
  openGraph: {
    title: 'Neurobots.io — AI That Answers When You Can\'t',
    description: 'The AI assistant that captures leads, qualifies them, and texts you instantly.',
    url: 'https://neurobots.io',
    siteName: 'Neurobots.io',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="min-h-full antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
