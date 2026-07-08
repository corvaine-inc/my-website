export const runtime = 'edge'

import { products } from './products-data'

console.log('Products loaded:', Object.keys(products))

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
