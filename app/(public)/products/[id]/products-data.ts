export const products: Record<string, {
  id: string
  name: string
  weight: string
  size: string
  description: string
  longDescription: string
  badge: string
  image: string
  accent: string
  features: string[]
  specifications: { label: string; value: string; icon: string }[]
}> = {
  "blazehaze-8kg": {
    id: "blazehaze-8kg",
    name: "BLAZEHAZE Premium",
    weight: "8kg",
    size: "8kg Bag",
    description: "Restaurant & Commercial Grade - Perfect for high-volume grilling.",
    longDescription: "Our flagship 8kg bag is designed for professional kitchens, restaurants, and serious BBQ enthusiasts who demand consistent, long-lasting heat. Made from premium hardwood, BLAZEHAZE 8kg delivers superior performance for high-volume grilling operations.",
    badge: "Best Seller",
    image: "/images/products/blazehaze-8kg.jpg",
    accent: "primary",
    features: [
      "Burns up to 6 hours at high heat",
      "Minimal ash production",
      "Quick ignition time",
      "Consistent heat distribution",
      "No chemical additives",
      "Sustainably sourced hardwood",
    ],
    specifications: [
      { label: "Weight", value: "8kg (17.6 lbs)", icon: "package" },
      { label: "Burn Time", value: "Up to 6 hours", icon: "clock" },
      { label: "Heat Output", value: "High (700°C+)", icon: "heat" },
      { label: "Ash Content", value: "Less than 3%", icon: "flame" },
      { label: "Packaging", value: "Heavy-duty paper bag", icon: "package" },
      { label: "No Spark", value: "Spark-free burning", icon: "spark" },
    ],
  },
  "blazehaze-3kg": {
    id: "blazehaze-3kg",
    name: "BLAZEHAZE Premium",
    weight: "3.5kg",
    size: "3.5kg Bag",
    description: "Home & Outdoor Grade - Ideal for backyard grilling and weekend cookouts.",
    longDescription: "The perfect size for home grilling enthusiasts. Our 3.5kg bag provides the same premium quality as our commercial grade, packaged conveniently for backyard BBQs, camping trips, and weekend cookouts.",
    badge: "Popular Choice",
    image: "/images/products/blazehaze-3kg.jpg",
    accent: "accent",
    features: [
      "Burns up to 6 hours at high heat",
      "Easy to store and transport",
      "Perfect for 6-8 person grilling",
      "Minimal smoke & spark",
      "No chemical additives",
      "Sustainably sourced hardwood",
    ],
    specifications: [
      { label: "Weight", value: "3.5kg (7.7 lbs)", icon: "package" },
      { label: "Burn Time", value: "Up to 6 hours", icon: "clock" },
      { label: "Heat Output", value: "High (700°C+)", icon: "heat" },
      { label: "Ash Content", value: "Less than 3%", icon: "flame" },
      { label: "Packaging", value: "Convenient carry bag", icon: "package" },
      { label: "No Spark", value: "Spark-free burning", icon: "spark" },
    ],
  },
}
