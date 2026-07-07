import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with CORVAINE for wholesale orders, distributor inquiries, or general questions about BLAZEHAZE charcoal.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
