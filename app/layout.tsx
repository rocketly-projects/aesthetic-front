import type { Metadata } from "next";
import { Inter, DM_Sans, Space_Grotesk } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import Toaster from "@/components/Toaster";
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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "aesthetic.",
  description: "Gestión para peluquerías y estéticas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}
      style={{ height: "100%" }}
    >
      <body style={{ height: "100%", margin: 0 }}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </body>
    </html>
  );
}
