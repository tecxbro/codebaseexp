import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";

// Configure Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SLIME Open Source',
  description: 'Generate beautiful wikis for your code repositories using AI.',
  // metadataBase: new URL('https://deepwiki.asyncfunc.com'), // Will update later
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground-muted)] antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
