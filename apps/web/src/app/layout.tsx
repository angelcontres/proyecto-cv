import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Studio | Plataforma Profesional",
  description:
    "Sistema web de CV profesional interactivo con constructor visual de lienzo libre y repositorio de certificaciones en PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
