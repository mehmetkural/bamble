import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/shared/ThemeProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bamble — Find your people",
  description: "Discover people nearby who share your goals and interests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=localStorage.getItem('bamble-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark');})()` }} />
      </head>
      <body className={`${manrope.variable} ${plusJakarta.variable} font-body h-full antialiased bg-[#f8fafb] dark:bg-[#0f1415] text-[#191c1d] dark:text-[#e1e3e4]`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
