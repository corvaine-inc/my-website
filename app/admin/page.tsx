import { Metadata } from "next"
import Link from "next/link"
import {
  Users,
  Building2,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard",
}

const statCards = [
  {
    title: "Total Users",
    icon: Users,
    value: "—",
    change: null,
    href: "/admin/users",
  },
  {
    title: "Distributors",
    icon: Building2,
    value: "—",
    change: null,
    href: "/admin/distributors",
  },
  {
    title: "Products",
    icon: Package,
    value: "—",
    change: null,
    href: "/admin/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    value: "—",
    change: null,
    href: "/admin/orders",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative group">
            <Link href={stat.href} className="absolute inset-0" aria-label={`View ${stat.title}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== null && (
                <p className={cn(
                  "text-xs flex items-center gap-1 mt-1",
                  stat.change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(stat.change)}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/users">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/products">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Manage Products
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/orders">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  View Orders
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/distributors">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Manage Distributors
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
              <p className="text-sm mt-1">
                Activity will appear here as users interact with the platform
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
