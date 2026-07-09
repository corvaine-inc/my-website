import type { MetadataRoute } from 'next'
import { products } from './(public)/products/[id]/products-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://corvaine.ca'

  const staticPages: MetadataRoute.Sitemap = [
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
  ]

  const productPages: MetadataRoute.Sitemap = Object.keys(products).map((id) => ({
    url: `${baseUrl}/products/${id}`,
    lastModified: new Date(),
    priority: 0.6,
  }))

  return [...staticPages, ...productPages]
}
