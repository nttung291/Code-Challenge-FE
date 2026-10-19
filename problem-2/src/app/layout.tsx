import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import Providers from "./services/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Token Swap",
  description: "Swap tokens at live prices from the Switcheo price feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
