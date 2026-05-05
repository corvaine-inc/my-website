import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"

const footerLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Cookie Policy", href: "/cookies" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/40">
      <div className="container py-10">
        <div className="flex flex-col items-center gap-8">
          {/* BLAZEHAZE is a product of CORVAINE */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">BLAZEHAZE</span> is a product of
            </p>
            <Image
              src={siteConfig.images.corvaineLogoLight}
              alt="CORVAINE"
              width={140}
              height={56}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </nav>
          
          {/* Bottom bar with copyright and portal links */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              BLAZEHAZE. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Distributor Portal
              </Link>
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
