import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ 
  subsets: ["latin"], 
  weight: ["600", "700", "800"],
  variable: "--font-syne"
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans"
});

export const metadata: Metadata = {
  title: "REFRESKITOS BRAND HUB",
  description: "Plataforma de gestión de marca y smarketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default to dark class to satisfy the native dark mode requirement, 
    // but allowing toggling later via state/next-themes
    <html lang="es" className="dark">
      <body className={`${dmSans.variable} ${syne.variable} bg-black text-text font-sans antialiased min-h-screen relative scrollbar-minimal selection:bg-magenta selection:text-black`}>
        {/* Background Marketing Pattern */}
        <div className="pointer-events-none fixed inset-0 z-[-1] bg-marketing-pattern bg-[length:200px_200px] opacity-100 mix-blend-screen dark:mix-blend-lighten transition-opacity"></div>
        {children}
      </body>
    </html>
  );
}
