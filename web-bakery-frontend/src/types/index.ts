// Auth & User Types
export type UserRole = 'USER' | 'ADMIN' | 'STAFF_WAREHOUSE' | 'STAFF_SALES'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  active: boolean
  forcePasswordChange?: boolean
  createdAt?: string
}

export interface AuthResponse {
  accessToken?: string
  token: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
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
  costAtSale?: number
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
  status?: string
  shippingAddress?: { fullName?: string; phone?: string; addressLine?: string }
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
  paymentMethod: 'COD' | 'VIETQR' | 'MOMO'
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
  subtotal?: number
  shippingFee?: number
  discountAmount?: number
  voucherCode?: string
  pointsUsed?: number
  pointsDiscountAmount?: number
  pointsEarned?: number
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
  paymentMethod: 'COD' | 'VIETQR' | 'MOMO'
  voucherCode?: string
  pointsUsed?: number
  pointsDiscountAmount?: number
  pointsEarned?: number
}

// Inventory & Purchase Receipt Types
export interface PurchaseReceipt {
  id: string
  receiptCode: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  totalCost: number
  supplier: string
  importedAt: string
  note?: string
}

export interface PurchaseReceiptBatchRequest {
  productIds: string[]
  quantities: number[]
  unitCosts: number[]
  supplier: string
  note?: string
}

export interface InventoryTransaction {
  id: string
  productId: string
  productName: string
  type: 'IMPORT' | 'EXPORT' | 'RETURN' | 'DAMAGE' | 'ORDER'
  quantity: number
  stockBefore: number
  stockAfter: number
  unitCost?: number
  referenceType?: string
  referenceId?: string
  note?: string
  createdAt: string
}

// Financial Report Types
export interface RevenueTrendItem {
  date: string
  revenue: number
  orderCount: number
}

export interface TopSellingProduct {
  productId: string
  productName: string
  imageUrl?: string
  quantity: number
  revenue: number
}

export interface RevenueReportResponse {
  revenueTotal: number
  revenueOrderCount: number
  cancelledOrderCount: number
  importCostTotal: number
  importedQuantityTotal: number
  profitTotal: number
  revenueTrend: RevenueTrendItem[]
  topSellingProducts: TopSellingProduct[]
}

// Contact Message Types
export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'NEW' | 'RESOLVED' | 'SPAM'
  createdAt: string
}

// Payment Status Types
export interface PaymentStatus {
  orderId: string
  orderCode: string
  orderStatus: string
  paymentStatus: string
  isPaid: boolean
  total: number
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


// Address Types
export interface Address {
  id: string
  userId: string
  receiverName: string
  phone: string
  addressLine: string
  province?: string
  district?: string
  ward?: string
  fullAddress: string
  defaultAddress: boolean
}

export interface AddressRequest {
  receiverName: string
  phone: string
  addressLine: string
  province?: string
  district?: string
  ward?: string
  defaultAddress?: boolean
}

// Review Types
export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
}

export interface ProductReviewSummary {
  reviews: ProductReview[]
  canReview: boolean
  myReview?: ProductReview | null
  averageRating: number
  reviewCount: number
}

export interface ProductReviewRequest {
  rating: number
  comment: string
}

export interface ContactSubmitRequest {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}


// Voucher Types
export interface Voucher {
  id: number | string
  code: string
  name: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  usedCount?: number
  active: boolean
  isExpired?: boolean
}

export interface VoucherCalculation {
  valid: boolean
  code: string
  message: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
}

// Loyalty & VVIP Tier Types
export interface LoyaltySummary {
  userId: string
  loyaltyPoints: number
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'
  tierDisplayName: string
  earnRate: number
  earnPercent: number
  totalSpent: number
  nextTierThreshold: number
  nextTierName: string
  amountToNextTier: number
  progressPercent: number
  pointValueVnd: number
}

export interface LoyaltyTransaction {
  id: string
  userId: string
  orderId?: string
  transactionType: 'EARN_PURCHASE' | 'REDEEM_CHECKOUT' | 'BIRTHDAY_GIFT' | 'CANCEL_REFUND' | 'ADMIN_ADJUST'
  transactionTypeName: string
  points: number
  balanceAfter: number
  description: string
  createdAt: string
}

export interface LoyaltyTierPerk {
  tier: string
  name: string
  spendThreshold: number
  earnRate: string
  perks: string[]
}

// Batch & Shelf-Life Management Types
export interface ProductBatch {
  id: string
  productId: string
  productName?: string
  productImageUrl?: string
  originalPrice?: number
  discountedPrice?: number
  batchCode: string
  manufactureDate: string
  expiryDate: string
  initialQuantity: number
  currentQuantity: number
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'SOLD_OUT'
  discountPercent: number
  note?: string
  daysRemaining: number
  alertLevel: 'SAFE' | 'WARNING' | 'DANGER'
  createdAt: string
}

export interface ProductBatchRequest {
  productId: string
  batchCode?: string
  manufactureDate: string
  expiryDate: string
  initialQuantity: number
  note?: string
}

export interface BatchFlashSaleRequest {
  discountPercent: number
  note?: string
}

export interface BatchStats {
  totalBatches: number
  activeBatches: number
  nearExpiryBatches: number
  expiredBatches: number
  flashSaleBatches: number
}
