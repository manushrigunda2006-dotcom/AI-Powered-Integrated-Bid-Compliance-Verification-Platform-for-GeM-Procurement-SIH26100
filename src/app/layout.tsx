import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'GeM Automated Verification & Compliance Assistant | Smart India Hackathon',
  description:
    'Explainable, human-in-the-loop verification and deterministic compliance engine for Government e-Marketplace (GeM) procurement officers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F7F9FC] text-slate-900 antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9FC]">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">GeM GovTech AI</span>
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
      </body>
    </html>
  );
}
