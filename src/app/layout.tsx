import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: {
    default: "NaijaBiz - Verified Vendor Directory & Online Ordering",
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
    title: "NaijaBiz - Get free Customers and grow your business",
    description: "Stop losing sales to trust issues. Get your verified green badge and Business Page today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NaijaBiz - Verified Your Business Page",
    description: "The link that proves you are legit. Get verified and sell more.",
    creator: "@naijabiz",
  },
  icons: {
    icon: [
      { url: "/small-logo.png", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/logo.png",
    shortcut: "/small-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased text-gray-900 bg-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
