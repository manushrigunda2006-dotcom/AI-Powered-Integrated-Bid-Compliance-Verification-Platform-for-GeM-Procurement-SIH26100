import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'GeM Automated Verification & Compliance Assistant | Smart India Hackathon',
  description:
    'An AI-powered bid compliance and verification platform that helps procurement teams analyze tender documents, verify bidder eligibility, identify compliance gaps, assess risks, and maintain a transparent audit trail. The system combines AI-assisted document analysis with rule-based verification to make procurement review faster, clearer, and more reliable.',
};

import { Footer } from '@/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F7F9FC] text-slate-900 antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9FC]">
        <LanguageProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
