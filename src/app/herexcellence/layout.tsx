import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Her Excellence | Every elegant woman\'s closet',
  description: 'Her Excellence is a ready-to-wear label for the professional Nigerian woman who commands presence without sacrificing ease. Refined silhouettes. Everyday elegance. Built for women who run things.',
  openGraph: {
    title: 'Her Excellence | Every elegant woman\'s closet',
    description: 'Her Excellence is a ready-to-wear label for the professional Nigerian woman who commands presence without sacrificing ease.',
    url: 'https://naijabiz.org/herexcellence',
    siteName: 'Her Excellence',
    images: [
      {
        url: '/herexcellence.jpeg',
        width: 1200,
        height: 630,
        alt: 'Her Excellence Logo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Her Excellence | Every elegant woman\'s closet',
    description: 'Her Excellence is a ready-to-wear label for the professional Nigerian woman who commands presence without sacrificing ease.',
    images: ['/herexcellence.jpeg'],
  },
  icons: {
    icon: '/herexcellence.jpeg',
    shortcut: '/herexcellence.jpeg',
    apple: '/herexcellence.jpeg',
  },
};

export default function HerExcellenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f5f5] min-h-screen selection:bg-[#d4af37] selection:text-black">
      {children}
    </div>
  );
}
