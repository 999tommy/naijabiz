import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: {
    default: "Qriblo | A virtual assistant for your brand",
    template: "%s | Qriblo"
  },
  applicationName: "Qriblo",
  description: "Give your brand a virtual assistant that answers customer questions and captures order or booking requests, backed by your brand page, catalog, and instructions.",
  keywords: ["Qriblo", "virtual assistant for brands Nigeria", "brand page Nigeria","brand page with virtual assistant", "WhatsApp brand assistant", "Nigerian brand directory", "product catalog", "service bookings", "appointment requests", "online storefront for growing brands"],
  authors: [{ name: "Qriblo Team" }],
  creator: "Qriblo",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Qriblo",
    title: "Qriblo | A virtual assistant for your brand",
    description: "Give your brand a virtual assistant that answers questions and captures order or booking requests, supported by a page with your products, services, and brand details.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qriblo | A virtual assistant for your brand",
    description: "Give your brand a virtual assistant to answer questions and capture order or booking requests, backed by your page, catalog, and brand details.",
    creator: "@qriblo",
  },
  icons: {
    icon: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
    apple: "/logo.png",
    shortcut: "/logo-white.png",
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
    "url": siteUrl,
    "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.png`, "width": 512, "height": 512 },
    "sameAs": [
      "https://twitter.com/qriblo",
      "https://instagram.com/qriblo"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "qriblovirtual@gmail.com"
    }
  }
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Qriblo",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${siteUrl}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <html lang="en-NG">
      <body className="font-sans antialiased text-gray-900 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
