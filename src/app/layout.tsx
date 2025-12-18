import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "NaijaBiz - Verified Vendor Directory & WhatsApp Ordering",
    template: "%s | NaijaBiz"
  },
  description: "The only link you need in your bio. Create a verified business page, look professional, and receive organized WhatsApp orders. Join 500+ Nigerian businesses.",
  keywords: ["Nigeria Business Directory", "WhatsApp Store", "Instagram Vendor Tool", "Legit Vendor", "NaijaBiz", "Sell on WhatsApp"],
  authors: [{ name: "NaijaBiz Team" }],
  creator: "NaijaBiz",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://naijabiz.org'),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "NaijaBiz",
    title: "NaijaBiz - Verified Vendor Directory",
    description: "Stop losing sales to trust issues. Get your verified green badge and WhatsApp order link today.",
    images: [
      {
        url: "/og-image.jpg", // We should ideally create this image
        width: 1200,
        height: 630,
        alt: "NaijaBiz Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NaijaBiz - Verified Vendor Directory",
    description: "The link that proves you are legit. Get verified and sell more.",
    images: ["/og-image.jpg"],
    creator: "@naijabiz",
  },
  icons: {
    icon: "/small-logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-gray-900 bg-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
