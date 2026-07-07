import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read CORVAINE's privacy policy to learn how we collect, use, and protect your personal information.",
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
