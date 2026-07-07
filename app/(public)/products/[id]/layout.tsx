export const runtime = 'edge'

import type { Metadata } from 'next'
import { products } from './page'

export function generateStaticParams() {
  return Object.keys(products).map((id) => ({ id }))
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
    title: `${product.name} ${product.weight}`,
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
