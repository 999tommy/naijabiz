import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Qriblo – Your Brand's Home on the Internet",
    template: "%s | Qriblo"
  },
  description: "Qriblo gives product brands, service providers, and artisans a beautiful branded link — with a catalog, virtual assistant, and booking page all in one place.",
  keywords: ["brand link", "business page", "WhatsApp store", "online storefront", "booking page", "brand identity", "Qriblo", "sell online", "service booking"],
  authors: [{ name: "Qriblo Team" }],
  creator: "Qriblo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Qriblo",
    title: "Qriblo – The link that puts your brand in the spotlight",
    description: "Claim one beautiful link where customers discover your story, browse your catalog, and book your services — with a virtual assistant running your business 24/7.",
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Qriblo Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qriblo – The link that puts your brand in the spotlight",
    description: "Claim your brand link free. Virtual assistant, catalog, and bookings — all in one place.",
    creator: "@qriblo",
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
    "name": "Qriblo",
    "url": "https://qriblo.com",
    "logo": "https://qriblo.com/logo.png",
    "sameAs": [
      "https://twitter.com/qriblo",
      "https://instagram.com/qriblo"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@qriblo.com"
    }
  }

  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-900 bg-white">
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
