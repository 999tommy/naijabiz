/**
 * NaijaBiz Website Theme System
 * Category-weighted, deterministic per slug — no DB storage needed.
 */

export type ThemeId = 'warm-market' | 'clean-studio' | 'bold-lagos'

export interface WebsiteTheme {
  id: ThemeId
  /** Hero background gradient or solid */
  heroBg: string
  /** Hero text color */
  heroText: string
  /** Secondary text on hero */
  heroSubText: string
  /** Main accent color (buttons, badges, underlines) */
  accent: string
  /** Accent hover */
  accentHover: string
  /** Accent text (on accent bg) */
  accentText: string
  /** Page background */
  pageBg: string
  /** Card background */
  cardBg: string
  /** Card border */
  cardBorder: string
  /** Body text */
  bodyText: string
  /** Muted text */
  mutedText: string
  /** Section heading color */
  headingText: string
  /** Navbar glass tint */
  navBg: string
  /** Hero logo ring color */
  logoRing: string
  /** CTA store button style */
  ctaBg: string
  ctaText: string
  /** Section divider style */
  divider: string
}

const themes: Record<ThemeId, WebsiteTheme> = {
  'warm-market': {
    id: 'warm-market',
    heroBg: 'linear-gradient(135deg, #da552f 0%, #c44422 60%, #1a1a1a 100%)',
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: '#da552f',
    accentHover: '#c44422',
    accentText: '#ffffff',
    pageBg: '#f7f4f0',
    cardBg: 'rgba(255,255,255,0.80)',
    cardBorder: 'rgba(0,0,0,0.07)',
    bodyText: '#1a1a1a',
    mutedText: '#6b7280',
    headingText: '#111827',
    navBg: 'rgba(255,255,255,0.85)',
    logoRing: '#da552f',
    ctaBg: '#ffffff',
    ctaText: '#da552f',
    divider: 'rgba(218,85,47,0.15)',
  },
  'clean-studio': {
    id: 'clean-studio',
    heroBg: 'linear-gradient(160deg, #f9f6f2 0%, #ede8e0 100%)',
    heroText: '#111827',
    heroSubText: '#6b7280',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentText: '#ffffff',
    pageBg: '#fafaf9',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.06)',
    bodyText: '#1a1a1a',
    mutedText: '#6b7280',
    headingText: '#111827',
    navBg: 'rgba(255,255,255,0.92)',
    logoRing: '#7c3aed',
    ctaBg: '#7c3aed',
    ctaText: '#ffffff',
    divider: 'rgba(124,58,237,0.12)',
  },
  'bold-lagos': {
    id: 'bold-lagos',
    heroBg: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f172a 100%)',
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.75)',
    accent: '#10b981',
    accentHover: '#059669',
    accentText: '#ffffff',
    pageBg: '#f0fdf4',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(0,0,0,0.06)',
    bodyText: '#0f172a',
    mutedText: '#6b7280',
    headingText: '#064e3b',
    navBg: 'rgba(255,255,255,0.88)',
    logoRing: '#10b981',
    ctaBg: '#10b981',
    ctaText: '#ffffff',
    divider: 'rgba(16,185,129,0.15)',
  },
}

/**
 * Category → preferred theme mapping
 * Categories that share similar vibes get grouped together.
 */
const categoryThemeMap: Record<string, ThemeId> = {
  // Warm market: food, beauty, fashion, baby/kids — warm/vibrant
  'food-drinks': 'warm-market',
  'food & drink': 'warm-market',
  'food & drinks': 'warm-market',
  'beauty-cosmetics': 'warm-market',
  'beauty & cosmetics': 'warm-market',
  'wigs-hair': 'warm-market',
  'wigs & hair': 'warm-market',
  'fashion': 'warm-market',
  'baby-kids': 'warm-market',
  'baby & kids': 'warm-market',
  'art-crafts': 'warm-market',
  'art & crafts': 'warm-market',

  // Clean studio: tech, electronics, health, books, sports — minimal/precise
  'electronics': 'clean-studio',
  'phones-accessories': 'clean-studio',
  'phones & accessories': 'clean-studio',
  'health-wellness': 'clean-studio',
  'health & wellness': 'clean-studio',
  'books-stationery': 'clean-studio',
  'books & stationery': 'clean-studio',
  'sports-fitness': 'clean-studio',
  'sports & fitness': 'clean-studio',

  // Bold Lagos: services, automotive, home/furniture, jewelry — strong/earthy
  'services': 'bold-lagos',
  'automotive': 'bold-lagos',
  'home-furniture': 'bold-lagos',
  'home & furniture': 'bold-lagos',
  'jewelry-watches': 'bold-lagos',
  'jewelry & watches': 'bold-lagos',
  'shoes-bags': 'bold-lagos',
  'shoes & bags': 'bold-lagos',
  'others': 'bold-lagos',
}

/**
 * Deterministic hash from a string → 0, 1, or 2
 * Used as tiebreaker when category isn't mapped.
 */
function slugHash(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash) % 3
}

const themeIds: ThemeId[] = ['warm-market', 'clean-studio', 'bold-lagos']

/**
 * Get the website theme for a business.
 * Priority: category → slug hash fallback.
 */
export function getWebsiteTheme(
  categorySlug: string | null | undefined,
  categoryName: string | null | undefined,
  businessSlug: string,
): WebsiteTheme {
  // Try category slug first, then category name (lowercased)
  const key = (categorySlug || categoryName || '').toLowerCase().trim()
  const themeId = categoryThemeMap[key] || themeIds[slugHash(businessSlug)]
  return themes[themeId]
}

export { themes }
