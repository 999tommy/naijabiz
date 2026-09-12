/**
 * Qriblo Website Theme System
 * Category-weighted, deterministic per slug. Users see variety, but each brand
 * keeps the same palette unless its category or slug changes.
 */

export type ThemeId =
  | 'burgundy-glacier'
  | 'burnt-charcoal'
  | 'deep-teal-champagne'
  | 'iris-mauve'
  | 'copper-espresso'
  | 'sapphire-camel'
  | 'moss-amazon'
  | 'ruby-blush'
  | 'prussian-glacier'
  | 'byzantium-champagne'

export interface WebsiteTheme {
  id: ThemeId
  heroBg: string
  heroText: string
  heroSubText: string
  accent: string
  accentHover: string
  accentText: string
  pageBg: string
  cardBg: string
  cardBorder: string
  bodyText: string
  mutedText: string
  headingText: string
  navBg: string
  logoRing: string
  ctaBg: string
  ctaText: string
  divider: string
}

const colors = {
  burgundy: '#800020',
  glacier: '#88BDBC',
  charcoal: '#36454F',
  burntOrange: '#CC5500',
  deepTeal: '#004953',
  iris: '#5D3FD3',
  mauve: '#E0B0FF',
  copper: '#B87333',
  espresso: '#4B3621',
  sapphire: '#0F52BA',
  moss: '#8A9A5B',
  ruby: '#E0115F',
  champagne: '#F0E68C',
  amazon: '#3B7A57',
  byzantium: '#702963',
  blush: '#F4C2C2',
  prussianBlue: '#003153',
  camel: '#C19A6B',
}

const themes: Record<ThemeId, WebsiteTheme> = {
  'burgundy-glacier': {
    id: 'burgundy-glacier',
    heroBg: `linear-gradient(135deg, ${colors.burgundy} 0%, ${colors.charcoal} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.82)',
    accent: colors.burgundy,
    accentHover: colors.charcoal,
    accentText: '#ffffff',
    pageBg: '#fbf6f7',
    cardBg: '#ffffff',
    cardBorder: 'rgba(128,0,32,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.burgundy,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.glacier,
    ctaBg: colors.glacier,
    ctaText: colors.charcoal,
    divider: 'rgba(128,0,32,0.14)',
  },
  'burnt-charcoal': {
    id: 'burnt-charcoal',
    heroBg: `linear-gradient(135deg, ${colors.burntOrange} 0%, ${colors.charcoal} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.82)',
    accent: colors.burntOrange,
    accentHover: colors.charcoal,
    accentText: '#ffffff',
    pageBg: '#fbf7f4',
    cardBg: '#ffffff',
    cardBorder: 'rgba(204,85,0,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.charcoal,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.camel,
    ctaBg: colors.champagne,
    ctaText: colors.espresso,
    divider: 'rgba(204,85,0,0.14)',
  },
  'deep-teal-champagne': {
    id: 'deep-teal-champagne',
    heroBg: `linear-gradient(135deg, ${colors.deepTeal} 0%, ${colors.prussianBlue} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: colors.deepTeal,
    accentHover: colors.prussianBlue,
    accentText: '#ffffff',
    pageBg: '#f5faf9',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,73,83,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.deepTeal,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.champagne,
    ctaBg: colors.champagne,
    ctaText: colors.deepTeal,
    divider: 'rgba(0,73,83,0.14)',
  },
  'iris-mauve': {
    id: 'iris-mauve',
    heroBg: `linear-gradient(135deg, ${colors.iris} 0%, ${colors.byzantium} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: colors.iris,
    accentHover: colors.byzantium,
    accentText: '#ffffff',
    pageBg: '#fbf7ff',
    cardBg: '#ffffff',
    cardBorder: 'rgba(93,63,211,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.byzantium,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.mauve,
    ctaBg: colors.mauve,
    ctaText: colors.byzantium,
    divider: 'rgba(93,63,211,0.14)',
  },
  'copper-espresso': {
    id: 'copper-espresso',
    heroBg: `linear-gradient(135deg, ${colors.copper} 0%, ${colors.espresso} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.82)',
    accent: colors.copper,
    accentHover: colors.espresso,
    accentText: '#ffffff',
    pageBg: '#fbf8f4',
    cardBg: '#ffffff',
    cardBorder: 'rgba(184,115,51,0.18)',
    bodyText: colors.espresso,
    mutedText: 'rgba(75,54,33,0.70)',
    headingText: colors.espresso,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.camel,
    ctaBg: colors.camel,
    ctaText: colors.espresso,
    divider: 'rgba(184,115,51,0.16)',
  },
  'sapphire-camel': {
    id: 'sapphire-camel',
    heroBg: `linear-gradient(135deg, ${colors.sapphire} 0%, ${colors.prussianBlue} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: colors.sapphire,
    accentHover: colors.prussianBlue,
    accentText: '#ffffff',
    pageBg: '#f5f8fd',
    cardBg: '#ffffff',
    cardBorder: 'rgba(15,82,186,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.prussianBlue,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.camel,
    ctaBg: colors.camel,
    ctaText: colors.prussianBlue,
    divider: 'rgba(15,82,186,0.14)',
  },
  'moss-amazon': {
    id: 'moss-amazon',
    heroBg: `linear-gradient(135deg, ${colors.amazon} 0%, ${colors.deepTeal} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: colors.amazon,
    accentHover: colors.deepTeal,
    accentText: '#ffffff',
    pageBg: '#f6f8f2',
    cardBg: '#ffffff',
    cardBorder: 'rgba(59,122,87,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.deepTeal,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.moss,
    ctaBg: colors.moss,
    ctaText: '#ffffff',
    divider: 'rgba(59,122,87,0.14)',
  },
  'ruby-blush': {
    id: 'ruby-blush',
    heroBg: `linear-gradient(135deg, ${colors.ruby} 0%, ${colors.burgundy} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.82)',
    accent: colors.ruby,
    accentHover: colors.burgundy,
    accentText: '#ffffff',
    pageBg: '#fff7f8',
    cardBg: '#ffffff',
    cardBorder: 'rgba(224,17,95,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.burgundy,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.blush,
    ctaBg: colors.blush,
    ctaText: colors.burgundy,
    divider: 'rgba(224,17,95,0.14)',
  },
  'prussian-glacier': {
    id: 'prussian-glacier',
    heroBg: `linear-gradient(135deg, ${colors.prussianBlue} 0%, ${colors.deepTeal} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.80)',
    accent: colors.prussianBlue,
    accentHover: colors.deepTeal,
    accentText: '#ffffff',
    pageBg: '#f4f9fa',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,49,83,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.prussianBlue,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.glacier,
    ctaBg: colors.glacier,
    ctaText: colors.prussianBlue,
    divider: 'rgba(0,49,83,0.14)',
  },
  'byzantium-champagne': {
    id: 'byzantium-champagne',
    heroBg: `linear-gradient(135deg, ${colors.byzantium} 0%, ${colors.espresso} 100%)`,
    heroText: '#ffffff',
    heroSubText: 'rgba(255,255,255,0.82)',
    accent: colors.byzantium,
    accentHover: colors.espresso,
    accentText: '#ffffff',
    pageBg: '#fbf7fb',
    cardBg: '#ffffff',
    cardBorder: 'rgba(112,41,99,0.16)',
    bodyText: colors.charcoal,
    mutedText: 'rgba(54,69,79,0.72)',
    headingText: colors.byzantium,
    navBg: 'rgba(255,255,255,0.90)',
    logoRing: colors.champagne,
    ctaBg: colors.champagne,
    ctaText: colors.espresso,
    divider: 'rgba(112,41,99,0.14)',
  },
}

const categoryThemeMap: Record<string, ThemeId[]> = {
  'food-drinks': ['burnt-charcoal', 'copper-espresso', 'deep-teal-champagne'],
  'food & drink': ['burnt-charcoal', 'copper-espresso', 'deep-teal-champagne'],
  'food & drinks': ['burnt-charcoal', 'copper-espresso', 'deep-teal-champagne'],
  'beauty-cosmetics': ['burgundy-glacier', 'ruby-blush', 'byzantium-champagne'],
  'beauty & cosmetics': ['burgundy-glacier', 'ruby-blush', 'byzantium-champagne'],
  'wigs-hair': ['burgundy-glacier', 'ruby-blush', 'iris-mauve'],
  'wigs & hair': ['burgundy-glacier', 'ruby-blush', 'iris-mauve'],
  'fashion': ['ruby-blush', 'byzantium-champagne', 'copper-espresso'],
  'baby-kids': ['ruby-blush', 'iris-mauve'],
  'baby & kids': ['ruby-blush', 'iris-mauve'],
  'art-crafts': ['copper-espresso', 'byzantium-champagne'],
  'art & crafts': ['copper-espresso', 'byzantium-champagne'],
  'electronics': ['sapphire-camel', 'prussian-glacier', 'iris-mauve'],
  'phones-accessories': ['sapphire-camel', 'prussian-glacier'],
  'phones & accessories': ['sapphire-camel', 'prussian-glacier'],
  'health-wellness': ['moss-amazon', 'deep-teal-champagne', 'prussian-glacier'],
  'health & wellness': ['moss-amazon', 'deep-teal-champagne', 'prussian-glacier'],
  'books-stationery': ['prussian-glacier', 'sapphire-camel'],
  'books & stationery': ['prussian-glacier', 'sapphire-camel'],
  'sports-fitness': ['moss-amazon', 'sapphire-camel'],
  'sports & fitness': ['moss-amazon', 'sapphire-camel'],
  'services': ['deep-teal-champagne', 'moss-amazon', 'prussian-glacier'],
  'automotive': ['burnt-charcoal', 'prussian-glacier'],
  'home-furniture': ['copper-espresso', 'moss-amazon'],
  'home & furniture': ['copper-espresso', 'moss-amazon'],
  'jewelry-watches': ['byzantium-champagne', 'sapphire-camel'],
  'jewelry & watches': ['byzantium-champagne', 'sapphire-camel'],
  'shoes-bags': ['copper-espresso', 'burgundy-glacier'],
  'shoes & bags': ['copper-espresso', 'burgundy-glacier'],
  'others': ['deep-teal-champagne', 'burnt-charcoal', 'iris-mauve'],
}

function slugHash(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash)
}

const fallbackThemeIds: ThemeId[] = [
  'burgundy-glacier',
  'burnt-charcoal',
  'deep-teal-champagne',
  'iris-mauve',
  'copper-espresso',
  'sapphire-camel',
  'moss-amazon',
  'ruby-blush',
  'prussian-glacier',
  'byzantium-champagne',
]

export function getWebsiteTheme(
  categorySlug: string | null | undefined,
  categoryName: string | null | undefined,
  businessSlug: string,
  businessType?: string | null,
): WebsiteTheme {
  if (businessType === 'both') {
    const hybridThemes: ThemeId[] = ['iris-mauve', 'burgundy-glacier', 'sapphire-camel', 'byzantium-champagne']
    return themes[hybridThemes[slugHash(businessSlug) % hybridThemes.length]]
  }

  if (businessType === 'services') {
    const serviceThemes: ThemeId[] = ['deep-teal-champagne', 'moss-amazon', 'prussian-glacier']
    return themes[serviceThemes[slugHash(businessSlug) % serviceThemes.length]]
  }

  const key = (categorySlug || categoryName || '').toLowerCase().trim()
  const categoryThemes = categoryThemeMap[key]
  const themeId = categoryThemes
    ? categoryThemes[slugHash(businessSlug) % categoryThemes.length]
    : fallbackThemeIds[slugHash(businessSlug) % fallbackThemeIds.length]

  return themes[themeId]
}

export { colors, themes }
