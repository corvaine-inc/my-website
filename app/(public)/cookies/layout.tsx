import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how CORVAINE uses cookies to improve your browsing experience on our website.",
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col w-full">
      {children}
    </div>
  )
}
