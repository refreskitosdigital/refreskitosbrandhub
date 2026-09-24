import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@400..800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-text font-sans antialiased min-h-screen relative scrollbar-minimal selection:bg-magenta selection:text-black">
        {/* Background Marketing Pattern */}
        <div className="pointer-events-none fixed inset-0 z-[-1] bg-marketing-pattern bg-[length:200px_200px] opacity-100 mix-blend-screen dark:mix-blend-lighten transition-opacity"></div>
        {children}
      </body>
    </html>
  );
}
