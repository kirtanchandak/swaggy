import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swaggy — Order food, just by talking",
  description: "Order food on Swiggy through a conversational AI interface. Just say what you want.",
  keywords: ["swiggy", "food ordering", "ai", "conversational", "chatgpt for food"],
  icons: {
    icon: [
      { url: '/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: '/favicon.jpg',
  },
  openGraph: {
    title: "Swaggy — Order food, just by talking",
    description: "ChatGPT for ordering on Swiggy. Search, compare, add to cart, apply coupons, place orders — all through conversation.",
    type: "website",
    images: [{ url: '/favicon.jpg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
