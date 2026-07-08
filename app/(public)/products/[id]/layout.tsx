export const runtime = 'edge'

import type { Metadata } from 'next'
import { products } from './products-data'

function formatWeight(weight: string): string {
  const match = weight.match(/^([\d.]+)kg$/i)
  return match ? `${match[1]} Kg.` : weight
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = products[id]

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} ${formatWeight(product.weight)} Charcoal`,
    description: product.longDescription,
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = products[id]

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": `${formatWeight(product.weight)} ${product.name} Lump Hardwood Charcoal`,
              "description": product.longDescription,
              "brand": {
                "@type": "Brand",
                "name": "BLAZEHAZE",
              },
              "image": `https://corvaine.ca${product.image}`,
              "sku": product.id,
            }),
          }}
        />
      )}
      {children}
    </>
  )
}
