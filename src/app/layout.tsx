import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'GeM Automated Verification & Compliance Assistant | Smart India Hackathon',
  description:
    'An AI-powered bid compliance and verification platform that helps procurement teams analyze tender documents, verify bidder eligibility, identify compliance gaps, assess risks, and maintain a transparent audit trail. The system combines AI-assisted document analysis with rule-based verification to make procurement review faster, clearer, and more reliable.',
};

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
          <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">GeM Compliance Assistant</span>
                <span>•</span>
                <span>Smart India Hackathon (SIH) MVP</span>
                <span>•</span>
                <span>Problem Statement: GeM Verification Assistant</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Deterministic RegTech Adapters
              </div>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
