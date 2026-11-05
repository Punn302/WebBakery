// Auth & User Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'USER' | 'ADMIN'
  active: boolean
  forcePasswordChange?: boolean
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
}

// Product & Category Types
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  active: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  active: boolean
  lowStockThreshold: number
  category?: Category
  averageCost?: number
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
}

// Cart Types
export interface CartItem {
  id?: number
  productId: string
  productName: string
  imageUrl: string
  price: number
  quantity: number
  total: number
}

export interface CartResponse {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// Order Types
export interface OrderItem {
  id?: number
  productId: string
  productName: string
  imageUrl: string
  price: number
  quantity: number
  total: number
}

export interface OrderStatusHistory {
  id: number
  orderId: string
  orderStatus: string
  paymentStatus: string
  note?: string
  changedBy: string
  createdAt: string
}

export interface ReturnHistory {
  id: number
  orderId: string
  returnStatus: string
  reason: string
  adminNote?: string
  changedBy: string
  createdAt: string
}

export interface Order {
  id: string
  orderCode: string
  userId: string
  customerName: string
  phone: string
  address: string
  note?: string
  paymentMethod: 'COD' | 'VIETQR'
  paymentStatus: 'PENDING' | 'PAID'
  orderStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'RECEIVED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED'
  shippingCarrier?: string
  trackingCode?: string
  returnReason?: string
  returnStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote?: string
  total: number
  inventoryDeducted: boolean
  items: OrderItem[]
  createdAt: string
}

export interface CheckoutRequest {
  customerName: string
  phone: string
  address: string
  province?: string
  district?: string
  ward?: string
  note?: string
  paymentMethod: 'COD' | 'VIETQR'
}

// API General Types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
