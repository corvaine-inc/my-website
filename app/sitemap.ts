import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://corvaine.ca'

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
    {
      url: `${baseUrl}/products/blazehaze-8kg`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/products/blazehaze-3kg`,
      lastModified: new Date(),
      priority: 0.6,
    },
  ]
}
