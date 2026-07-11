import { Timestamp } from 'firebase/firestore'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
export type UserRole = 'customer' | 'admin'
export type PromoType = 'percentage' | 'fixed'
export type VariantType = 'size' | 'color'

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  type: VariantType
  label: string
  value: string
  stock: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  subcategory?: string
  variants: ProductVariant[]
  stock: number
  rating: number
  reviewCount: number
  tags: string[]
  featured: boolean
  newArrival: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  name: string
  image: string
  slug: string
  variant?: {
    type: VariantType
    label: string
    value: string
  }
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface Address {
  id: string
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  isDefault?: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  items: CartItem[]
  status: OrderStatus
  shippingAddress: Address
  shippingMethod: ShippingMethod
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  promoCode?: string
  stripeSessionId?: string
  paymentIntentId?: string
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  addresses: Address[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userPhoto?: string
  rating: number
  title?: string
  comment: string
  verified: boolean
  createdAt: Timestamp
}

// ─── PromoCode ────────────────────────────────────────────────────────────────

export interface PromoCode {
  id: string
  code: string
  type: PromoType
  value: number
  minOrderValue?: number
  expiresAt?: Timestamp
  isActive: boolean
  usageCount: number
  maxUsage?: number
  description?: string
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productId: string
  addedAt: Timestamp
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'

// ─── Admin / Analytics ────────────────────────────────────────────────────────

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  lowStockProducts: number
}
