"use client";
import './globals.css';
import Navbar from '@/components/navbar';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}