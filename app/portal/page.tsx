import { Metadata } from "next"
import Link from "next/link"
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard",
}

const statCards = [
  {
    title: "Total Orders",
    icon: ShoppingCart,
    value: "—",
    description: "All time orders",
  },
  {
    title: "Active Orders",
    icon: Clock,
    value: "—",
    description: "Orders in progress",
  },
  {
    title: "Products Available",
    icon: Package,
    value: "—",
    description: "In your catalog",
  },
  {
    title: "This Month",
    icon: TrendingUp,
    value: "—",
    description: "Orders this month",
  },
]

export default function PortalDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back to your distributor portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent orders to display</p>
              <p className="text-sm mt-1">
                Your recent orders will appear here
              </p>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/portal/orders">
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/portal/products">
                <Package className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/portal/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/portal/account">
                <TrendingUp className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
