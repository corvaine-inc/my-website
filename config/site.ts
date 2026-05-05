export const siteConfig = {
  name: "BLAZEHAZE",
  companyName: "CORVAINE",
  tagline: "Premium Hardwood Charcoal",
  description: "BLAZEHAZE by CORVAINE - Premium hardwood charcoal for the ultimate grilling experience. Long-lasting burn, intense heat, pure flavor.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    twitter: "https://twitter.com/corvaine",
    instagram: "https://instagram.com/blazehaze",
    facebook: "https://facebook.com/blazehaze",
  },
  creator: "CORVAINE",
  keywords: [
    "charcoal",
    "hardwood charcoal", 
    "premium charcoal",
    "grilling",
    "BBQ",
    "BLAZEHAZE",
    "CORVAINE",
    "lump charcoal",
    "restaurant grade charcoal"
  ],
  contact: {
    email: "info@corvaine.com",
    phone: "+1 (555) 123-4567",
  },
  images: {
    corvaineLogo: "/images/corvaine-logo.svg?v=20260421a",
    corvaineLogoLight: "/images/corvaine-logo-light.svg?v=20260421a",
    blazehazeLogo: "/images/blazehaze-logo.svg?v=20260421a",
    blazehazeLogoLight: "/images/blazehaze-logo-light.svg?v=20260421a",
    heroVideo: "/videos/hero-fire.mp4",
  }
}

export type SiteConfig = typeof siteConfig
