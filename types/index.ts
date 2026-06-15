// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export type UserRole = "admin" | "distributor" | "user"
export type UserStatus = "active" | "inactive" | "pending"

// Distributor types
export interface Distributor {
  id: string
  userId: string
  companyName: string
  taxId?: string
  tier: DistributorTier
  status: DistributorStatus
  billingAddress: Address
  shippingAddress?: Address
  createdAt: Date
  updatedAt: Date
}

export type DistributorTier = "silver" | "gold" | "platinum"
export type DistributorStatus = "active" | "pending" | "suspended"

// Address types
export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  sku: string
  category: string
  status: ProductStatus
  imageUrl?: string
  imageAlt?: string
  createdAt: Date
  updatedAt: Date
}

export type ProductStatus = "active" | "draft" | "archived"

// Order types
export interface Order {
  id: string
  distributorId: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Form types
export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  company?: string
  subject: string
  message: string
}
