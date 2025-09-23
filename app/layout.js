import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Shadows_Into_Light } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hand = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
});

export const metadata = {
  title: "Sixth Sense Cooking | Daniel Webb",
  description: "Unlock your culinary intuition with Daniel Webb.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
      <body className={`${geistSans.variable} ${geistMono.variable} ${hand.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

