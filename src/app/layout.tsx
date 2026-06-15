import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif_Display } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const notoSerif = Noto_Serif_Display({
  variable: "--font-noto-serif",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Асыл Тұқым | Asyl Tuqym",
  description: "Билингвальный маркетплейс скота для фермеров Казахстана.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
