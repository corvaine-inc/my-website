import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://corvaine.ca'

  // TODO: replace this with your real product list
  const products = [
    { slug: 'product-1', updatedAt: new Date() },
    { slug: 'product-2', updatedAt: new Date() },
  ]

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      priority: 0.8,
    },
    ...productEntries,
  ]
}
