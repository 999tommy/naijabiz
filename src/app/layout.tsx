import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://qriblo.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: {
    default: "Qriblo | We deliver customers to your doorstep",
    template: "%s | Qriblo"
  },
  applicationName: "Qriblo",
  description: "Give your brand a platform that delivers customers straight to your doorstep. Handle inquiries, showcase products or services, and receive orders on WhatsApp.",
  keywords: ["Qriblo", "customer delivery Nigeria", "professional business site Nigeria","online business page Nigeria", "WhatsApp business catalog", "Nigerian business directory", "product catalog", "service bookings", "appointment requests", "online store for small business"],
  authors: [{ name: "Qriblo Team" }],
  creator: "Qriblo",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Qriblo",
    title: "Qriblo | We deliver customers to your doorstep",
    description: "Give customers one place to discover your business, browse products or services, and message you to place an order or request an appointment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qriblo | We deliver customers to your doorstep",
    description: "Give customers a page to browse your products or services, ask questions, and send order or appointment requests.",
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
