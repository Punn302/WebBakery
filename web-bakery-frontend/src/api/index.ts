const unwrap = <T>(res: any): T => res.data?.data ?? res.data;
import { axiosClient } from './axiosClient'
import type {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Product,
  Category,
  CartItem,
  CartResponse,
  Order,
  CheckoutRequest,
  PageResponse,
  PurchaseReceipt,
  PurchaseReceiptBatchRequest,
  InventoryTransaction,
  RevenueReportResponse,
  TopSellingProduct,
  ContactMessage,
  PaymentStatus,
  Address,
  AddressRequest,
  ProductReview,
  ProductReviewSummary,
  ContactSubmitRequest,
  ProductReviewRequest,
  Voucher,
  VoucherCalculation,
} from '@/types'

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<AuthResponse>('/auth/login', data)
    return unwrap(res)
  },
  register: async (data: RegisterRequest): Promise<User> => {
    const res = await axiosClient.post<User>('/auth/register', data)
    return unwrap(res)
  },
  me: async (): Promise<User> => {
    const res = await axiosClient.get<User>('/auth/me')
    return unwrap(res)
  },
}

// Product APIs
export const productApi = {
  getProducts: async (params?: {
    keyword?: string
    categoryId?: number
    page?: number
    size?: number
    activeOnly?: boolean
  }): Promise<PageResponse<Product>> => {
    const res = await axiosClient.get<PageResponse<Product>>('/products', { params })
    return unwrap(res)
  },
  getProductById: async (id: string): Promise<Product> => {
    const res = await axiosClient.get<Product>(`/products/${id}`)
    return unwrap(res)
  },
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<Category[]>('/categories')
    return unwrap(res)
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.post<Product>('/admin/products', data)
    return unwrap(res)
  },
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/products/${id}`, data)
    return unwrap(res)
  },
  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`)
  },
  adminCreateProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.post<Product>('/admin/products', data)
    return unwrap(res)
  },
  adminUpdateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/products/${id}`, data)
    return unwrap(res)
  },
  adminDeleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`)
  },
  adminCreateCategory: async (data: Partial<Category>): Promise<Category> => {
    const res = await axiosClient.post<Category>('/admin/categories', data)
    return unwrap(res)
  },
}

// Category APIs
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<Category[]>('/categories')
    return unwrap(res)
  },
}

// Cart APIs
export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const res = await axiosClient.get<CartResponse>('/cart')
    return unwrap(res)
  },
  addToCart: async (productId: string, quantity = 1): Promise<CartResponse> => {
    const res = await axiosClient.post<CartResponse>('/cart/add', { productId, quantity })
    return unwrap(res)
  },
  updateQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
    const res = await axiosClient.put<CartResponse>(`/cart/items/${productId}`, { quantity })
    return unwrap(res)
  },
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const res = await axiosClient.delete<CartResponse>(`/cart/items/${productId}`)
    return unwrap(res)
  },
  clearCart: async (): Promise<void> => {
    await axiosClient.delete('/cart')
  },
  syncCart: async (items: CartItem[]): Promise<CartResponse> => {
    const res = await axiosClient.post<CartResponse>('/cart/sync', items)
    return unwrap(res)
  },
}

// Order APIs
export const orderApi = {
  createOrder: async (data: CheckoutRequest): Promise<Order> => {
    const res = await axiosClient.post<Order>('/orders', data)
    return unwrap(res)
  },
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const res = await axiosClient.get<Order[]>('/orders/my-orders')
      return unwrap(res)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400 || status === 404) {
        return []
      }
      throw err
    }
  },
  getOrderById: async (id: string): Promise<Order> => {
    const res = await axiosClient.get<Order>(`/orders/${id}`)
    return unwrap(res)
  },
  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    const res = await axiosClient.post<Order>(`/orders/${id}/cancel`, { reason })
    return unwrap(res)
  },
  requestReturn: async (id: string, reason: string): Promise<Order> => {
    const res = await axiosClient.post<Order>(`/orders/${id}/return`, { reason })
    return unwrap(res)
  },
  confirmReceived: async (id: string): Promise<Order> => {
    const res = await axiosClient.put<Order>(`/orders/${id}/received`)
    return unwrap(res)
  },
  trackOrders: async (params: { orderId?: string; phone?: string }): Promise<Order[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Order[] }>('/orders/track', {
      params,
    })
    return unwrap(res)
  },
  adminSearchOrders: async (params?: {
    keyword?: string
    status?: string
    paymentMethod?: string
    page?: number
    size?: number
  }): Promise<PageResponse<Order>> => {
    const res = await axiosClient.get<PageResponse<Order>>('/admin/orders', { params })
    return unwrap(res)
  },
  adminUpdateStatus: async (
    id: string,
    status: string,
    carrier?: string,
    trackingCode?: string
  ): Promise<Order> => {
    const res = await axiosClient.patch<Order>(`/admin/orders/${id}/status`, {
      orderStatus: status,
      shippingCarrier: carrier,
      trackingCode,
    })
    return unwrap(res)
  },
  adminReviewReturn: async (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    adminNote?: string
  ): Promise<Order> => {
    const res = await axiosClient.post<Order>(`/admin/orders/${id}/return/review`, {
      decision,
      adminNote,
    })
    return unwrap(res)
  },
}

// Admin Users APIs
export const adminUserApi = {
  getUsers: async (params?: {
    keyword?: string
    page?: number
    size?: number
  }): Promise<PageResponse<User>> => {
    const res = await axiosClient.get<PageResponse<User>>('/admin/users', { params })
    return unwrap(res)
  },
  getUserById: async (id: string): Promise<User> => {
    const res = await axiosClient.get<User>(`/admin/users/${id}`)
    return unwrap(res)
  },
  updateUserRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await axiosClient.put<User>(`/admin/users/${id}/role`, { role })
    return unwrap(res)
  },
  updateUserStatus: async (id: string, active: boolean): Promise<User> => {
    const res = await axiosClient.patch<User>(`/admin/users/${id}/status`, { active })
    return unwrap(res)
  },
  resetPassword: async (id: string, newPassword?: string): Promise<User> => {
    const res = await axiosClient.post<User>(
      `/admin/users/${id}/reset-password`,
      newPassword ? { newPassword } : {}
    )
    return unwrap(res)
  },
}

// Admin Inventory APIs
export const adminInventoryApi = {
  getInventory: async (params?: {
    keyword?: string
    page?: number
    size?: number
  }): Promise<PageResponse<Product>> => {
    const res = await axiosClient.get<PageResponse<Product>>('/admin/inventory', { params })
    return unwrap(res)
  },
  updateThreshold: async (id: string, threshold: number): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/inventory/${id}/threshold`, { threshold })
    return unwrap(res)
  },
  createPurchaseReceipt: async (
    data: PurchaseReceiptBatchRequest
  ): Promise<PurchaseReceipt[]> => {
    const res = await axiosClient.post<PurchaseReceipt[]>('/admin/inventory/receipts', data)
    return unwrap(res)
  },
  getPurchaseReceipts: async (params?: {
    keyword?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }): Promise<PageResponse<PurchaseReceipt>> => {
    const res = await axiosClient.get<PageResponse<PurchaseReceipt>>('/admin/inventory/receipts', {
      params,
    })
    return unwrap(res)
  },
  getReceiptDetails: async (receiptCode: string): Promise<PurchaseReceipt[]> => {
    const res = await axiosClient.get<PurchaseReceipt[]>(
      `/admin/inventory/receipts/${receiptCode}`
    )
    return unwrap(res)
  },
}

// Admin Reports APIs
export const adminReportApi = {
  getRevenueReport: async (params?: {
    from?: string
    to?: string
  }): Promise<RevenueReportResponse> => {
    const res = await axiosClient.get<RevenueReportResponse>('/admin/reports/revenue', { params })
    return unwrap(res)
  },
  getTopSelling: async (params?: {
    from?: string
    to?: string
  }): Promise<TopSellingProduct[]> => {
    const res = await axiosClient.get<TopSellingProduct[]>('/admin/reports/top-selling', { params })
    return unwrap(res)
  },
  downloadPdf: async (from?: string, to?: string): Promise<Blob> => {
    const res = await axiosClient.get('/admin/reports/export-pdf', {
      params: { from, to },
      responseType: 'blob',
    })
    return unwrap(res)
  },
  downloadCsv: async (from?: string, to?: string): Promise<string> => {
    const res = await axiosClient.get('/admin/reports/export-csv', {
      params: { from, to },
      responseType: 'text',
    })
    return unwrap(res)
  },
}

// Admin Contacts APIs
export const adminContactApi = {
  getContacts: async (params?: {
    keyword?: string
    page?: number
    size?: number
  }): Promise<PageResponse<ContactMessage>> => {
    const res = await axiosClient.get<PageResponse<ContactMessage>>('/admin/contacts', { params })
    return unwrap(res)
  },
  updateStatus: async (id: string, status: 'RESOLVED' | 'SPAM'): Promise<ContactMessage> => {
    const res = await axiosClient.patch<ContactMessage>(`/admin/contacts/${id}/status`, { status })
    return unwrap(res)
  },
}

// Address APIs
export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Address[] }>('/addresses')
    return unwrap(res)
  },
  createAddress: async (data: AddressRequest): Promise<Address> => {
    const res = await axiosClient.post<{ success: boolean; data: Address }>('/addresses', data)
    return unwrap(res)
  },
  updateAddress: async (id: string, data: AddressRequest): Promise<Address> => {
    const res = await axiosClient.put<{ success: boolean; data: Address }>(`/addresses/${id}`, data)
    return unwrap(res)
  },
  deleteAddress: async (id: string): Promise<void> => {
    await axiosClient.delete(`/addresses/${id}`)
  },
}

// Review APIs
export const reviewApi = {
  getProductReviews: async (productId: string): Promise<ProductReviewSummary> => {
    const res = await axiosClient.get<{ success: boolean; data: ProductReviewSummary }>(
      `/products/${productId}/reviews`
    )
    return unwrap(res)
  },
  submitReview: async (productId: string, data: ProductReviewRequest): Promise<ProductReview> => {
    const res = await axiosClient.post<{ success: boolean; data: ProductReview }>(
      `/products/${productId}/reviews`,
      data
    )
    return unwrap(res)
  },
  deleteReview: async (reviewId: string): Promise<void> => {
    await axiosClient.delete(`/products/reviews/${reviewId}`)
  },
}

// Payment Status API (Polling)
export const paymentApi = {
  getOrderPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    const res = await axiosClient.get<{ success: boolean; data: PaymentStatus }>(
      `/payment/sepay/orders/${orderId}/status`
    )
    return unwrap(res)
  },
}

// Upload API (Cloudinary via Backend)
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axiosClient.post<{ url: string }>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return unwrap(res)
  },
}

// Contact Public API
export const contactApi = {
  submitContact: async (data: ContactSubmitRequest): Promise<ContactMessage> => {
    const res = await axiosClient.post<{ success: boolean; data: ContactMessage }>('/contact', data)
    return unwrap(res)
  },
}

// Voucher APIs
export const voucherApi = {
  getAvailable: async (): Promise<Voucher[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Voucher[] }>('/vouchers/available')
    return unwrap(res)
  },
  applyVoucher: async (data: { code: string; orderAmount: number }): Promise<VoucherCalculation> => {
    const res = await axiosClient.post<{ success: boolean; data: VoucherCalculation }>('/vouchers/apply', data)
    return unwrap(res)
  },
}

// Admin Voucher Management APIs
export const adminVoucherApi = {
  getAll: async (): Promise<Voucher[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Voucher[] }>('/admin/vouchers')
    return unwrap(res)
  },
  create: async (data: Partial<Voucher>): Promise<Voucher> => {
    const res = await axiosClient.post<{ success: boolean; data: Voucher }>('/admin/vouchers', data)
    return unwrap(res)
  },
  update: async (id: number | string, data: Partial<Voucher>): Promise<Voucher> => {
    const res = await axiosClient.put<{ success: boolean; data: Voucher }>(`/admin/vouchers/${id}`, data)
    return unwrap(res)
  },
  delete: async (id: number | string): Promise<void> => {
    await axiosClient.delete(`/admin/vouchers/${id}`)
  },
  toggleStatus: async (id: number | string): Promise<Voucher> => {
    const res = await axiosClient.patch<{ success: boolean; data: Voucher }>(`/admin/vouchers/${id}/toggle`)
    return unwrap(res)
  },
}

// User Account APIs
export const userApi = {
  updateProfile: async (data: { name: string; phone?: string }): Promise<User> => {
    const res = await axiosClient.put<User>('/user/profile', data)
    return unwrap(res)
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await axiosClient.post('/user/change-password', data)
  },
  getStatus: async (): Promise<{ loggedIn: boolean; user?: User }> => {
    const res = await axiosClient.get<{ loggedIn: boolean; user?: User }>('/user/status')
    return unwrap(res)
  },
}
