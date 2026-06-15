"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Logo } from "@/components/shared"

const iconMap = {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Settings,
}

type IconName = keyof typeof iconMap

interface NavItem {
  title: string
  href: string
  icon: IconName
}

interface NavSection {
  title: string
  items: NavItem[]
}

const adminSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
      { title: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", href: "/admin/users", icon: "Users" },
      { title: "Distributors", href: "/admin/distributors", icon: "Building2" },
      { title: "Products", href: "/admin/products", icon: "Package" },
      { title: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: "Settings" },
    ],
  },
]

function NavContent() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6" aria-label="Admin navigation">
      {adminSections.map((section) => (
        <Collapsible key={section.title} defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            {section.title}
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = iconMap[item.icon]
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
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/30 h-screen sticky top-0">
        <div className="p-6 border-b">
          <Logo href="/admin" size="lg" />
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 h-14">
        <Logo href="/admin" size="md" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b">
              <Logo href="/admin" size="lg" />
              <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
              <NavContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
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
