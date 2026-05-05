import { Metadata } from "next"
import { Search, Grid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { ProductImagePlaceholder } from "@/components/shared"

export const metadata: Metadata = {
  title: "Products",
}

export default function PortalProductsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse available products for ordering
        </p>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                aria-label="Search products"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Select category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="category-1">Category 1</SelectItem>
                <SelectItem value="category-2">Category 2</SelectItem>
                <SelectItem value="category-3">Category 3</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[140px]" aria-label="Sort products">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex gap-1">
              <Toggle aria-label="Grid view" pressed>
                <Grid className="h-4 w-4" />
              </Toggle>
              <Toggle aria-label="List view">
                <List className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <ProductImagePlaceholder
              productName={`Product ${i + 1}`}
              className="border-b"
            />
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Category
              </p>
              <CardTitle className="text-base">Product Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                Brief product description placeholder text.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Price: —</span>
                <Button size="sm">Add to Order</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More Products</Button>
      </div>
    </div>
  )
}
