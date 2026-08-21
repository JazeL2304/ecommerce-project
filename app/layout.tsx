import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Olist Brazil — Executive Analytics Dashboard',
  description: 'Data-driven e-commerce intelligence and customer behavior dashboard built with Next.js 15, Tailwind v4, and SQLite.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#F3F4F6] text-[#141B2B] antialiased min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
