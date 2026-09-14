import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

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
    <html lang="en" className="h-full bg-[#F7F9FC] text-slate-900 antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gem_app_theme');if(t==='dark'){document.documentElement.classList.add('dark');}var l=localStorage.getItem('gem_language');if(l==='ks'){document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ks');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9FC]">
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
