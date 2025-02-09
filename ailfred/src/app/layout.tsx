import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Ailfred - Your DeFi Butler",
  description: "A sophisticated DeFi butler powered by AI, helping you navigate the world of decentralized finance on Base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-black`}>
      <body className="fixed inset-0 bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}