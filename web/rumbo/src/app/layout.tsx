import type { Metadata } from "next";
import { Quicksand, Figtree} from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rumbo: Finanzas personales",
  description: "Toma el control de tus finanzas personales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${quicksand.variable} ${figtree.variable} antialiased ${figtree.className}`}
      >
        {children}
      </body>
    </html>
  );
}
