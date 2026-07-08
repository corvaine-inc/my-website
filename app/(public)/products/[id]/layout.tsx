export const runtime = 'edge'

import type { Metadata } from 'next'
import { products } from './products-data'

function formatWeight(weight: string): string {
  // Converts "8kg" -> "8 Kg." and "3.5kg" -> "3.5 Kg."
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

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
