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
    default: "NaijaBiz – Nigerian Business Directory & Online Store Builder",
    template: "%s | NaijaBiz"
  },
  description: "NaijaBiz helps Nigerian businesses create verified online pages, accept WhatsApp orders, and grow online.",
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
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'NaijaBiz Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NaijaBiz - Verified Your Business Page",
    description: "The link that proves you are legit. Get verified and sell more.",
    creator: "@naijabiz",
    images: ['/logo.png'],
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NaijaBiz",
    "url": "https://naijabiz.org",
    "logo": "https://naijabiz.org/logo.png",
    "sameAs": [
      "https://twitter.com/naijabiz",
      "https://instagram.com/naijabiz"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@naijabiz.org"
    }
  }

  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased text-gray-900 bg-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
