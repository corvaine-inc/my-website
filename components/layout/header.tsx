"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut, User, ShoppingBag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/shared/logo"
import { publicNavigation } from "@/config/navigation"
import { useSession } from "@/hooks/use-session"

export function Header() {
  const pathname = usePathname()
  const { role, isAuthenticated, isLoading, logout } = useSession()
  
  // Check if we're on the homepage with video hero
  const isHomepage = pathname === "/"

  return (
    <header 
      className={cn(
        "w-full transition-all duration-300",
        isHomepage 
          ? "absolute top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent" 
          : "sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Logo variant="corvaine" size="md" colorScheme="light" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isHomepage 
                  ? "text-white/80 hover:text-white" 
                  : "hover:text-primary",
                pathname === item.href
                  ? isHomepage ? "text-white" : "text-foreground"
                  : isHomepage ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted/50" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "gap-2",
                    isHomepage && "text-white hover:text-white hover:bg-white/10"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium capitalize">{role} Account</p>
                </div>
                <DropdownMenuSeparator />
                {role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {role === 'distributor' && (
                  <DropdownMenuItem asChild>
                    <Link href="/portal">Distributor Portal</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/portal/account">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                asChild
                className={cn(
                  isHomepage && "text-white hover:text-white hover:bg-white/10"
                )}
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button 
                asChild
                className={cn(
                  isHomepage && "bg-primary hover:bg-primary/90"
                )}
              >
                <Link href="/register">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Open menu"
              className={cn(
                isHomepage && "text-white hover:text-white hover:bg-white/10"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
            <div className="mt-6 mb-8">
              <Logo variant="corvaine" size="md" href="/" colorScheme="light" />
            </div>
            <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary py-2",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
              <div className="border-t border-border pt-4 mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2">
                      <p className="font-medium capitalize">{role} Account</p>
                    </div>
                    {role === 'admin' && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/admin">Admin Dashboard</Link>
                      </Button>
                    )}
                    {role === 'distributor' && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/portal">Distributor Portal</Link>
                      </Button>
                    )}
                    <Button variant="ghost" onClick={logout} className="w-full justify-start text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
