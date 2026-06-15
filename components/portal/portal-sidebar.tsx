"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  User,
  LogOut,
  Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/shared"

const portalNavItems = [
  {
    title: "Dashboard",
    href: "/portal",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/portal/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    href: "/portal/products",
    icon: Package,
  },
  {
    title: "Account",
    href: "/portal/account",
    icon: User,
  },
]

function NavContent() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Portal navigation">
      {portalNavItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export function PortalSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/30 h-screen sticky top-0">
        <div className="p-6 border-b">
          <Logo href="/portal" size="lg" />
          <p className="text-xs text-muted-foreground mt-1">Distributor Portal</p>
        </div>
        <div className="flex-1 p-4">
          <NavContent />
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Header with Sheet */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 h-14">
        <Logo href="/portal" size="md" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b">
              <Logo href="/portal" size="lg" />
              <p className="text-xs text-muted-foreground mt-1">Distributor Portal</p>
            </div>
            <div className="p-4">
              <NavContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/">
                  <LogOut className="h-4 w-4" />
                  Back to Site
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
