
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CyberSidebar } from '@/components/cyber-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AEGIS AI - Cyber Defense System',
  description: 'Advanced AI-powered cybersecurity dashboard for real-time threat detection and network monitoring',
  keywords: 'cybersecurity, AI, DDoS detection, network security, threat intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white overflow-x-hidden`}>
        <div className="flex min-h-screen">
          <CyberSidebar />
          <main className="flex-1 ml-64 p-6 matrix-bg min-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
