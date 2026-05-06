import type { Metadata } from "next";
import { Inter, DM_Sans, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aesthetic.",
  description: "Gestión para peluquerías y estéticas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${dmSans.variable} ${geistMono.variable}`}
      style={{ height: "100%" }}
    >
      <body style={{ height: "100%", margin: 0 }}>
          <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
  );
}
