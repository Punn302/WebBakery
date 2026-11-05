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
} from '@/types'

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },
  register: async (data: RegisterRequest): Promise<User> => {
    const res = await axiosClient.post<User>('/auth/register', data)
    return res.data
  },
  me: async (): Promise<User> => {
    const res = await axiosClient.get<User>('/auth/me')
    return res.data
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
    return res.data
  },
  getProductById: async (id: string): Promise<Product> => {
    const res = await axiosClient.get<Product>(`/products/${id}`)
    return res.data
  },
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<Category[]>('/categories')
    return res.data
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.post<Product>('/admin/products', data)
    return res.data
  },
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/products/${id}`, data)
    return res.data
  },
  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`)
  },
  adminCreateProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.post<Product>('/admin/products', data)
    return res.data
  },
  adminUpdateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/products/${id}`, data)
    return res.data
  },
  adminDeleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`)
  },
  adminCreateCategory: async (data: Partial<Category>): Promise<Category> => {
    const res = await axiosClient.post<Category>('/admin/categories', data)
    return res.data
  },
}

// Category APIs
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<Category[]>('/categories')
    return res.data
  },
}

// Cart APIs
export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const res = await axiosClient.get<CartResponse>('/cart')
    return res.data
  },
  addToCart: async (productId: string, quantity = 1): Promise<CartResponse> => {
    const res = await axiosClient.post<CartResponse>('/cart/add', { productId, quantity })
    return res.data
  },
  updateQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
    const res = await axiosClient.put<CartResponse>(`/cart/items/${productId}`, { quantity })
    return res.data
  },
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const res = await axiosClient.delete<CartResponse>(`/cart/items/${productId}`)
    return res.data
  },
  clearCart: async (): Promise<void> => {
    await axiosClient.delete('/cart')
  },
  syncCart: async (items: CartItem[]): Promise<CartResponse> => {
    const res = await axiosClient.post<CartResponse>('/cart/sync', items)
    return res.data
  },
}

// Order APIs
export const orderApi = {
  createOrder: async (data: CheckoutRequest): Promise<Order> => {
    const res = await axiosClient.post<Order>('/orders', data)
    return res.data
  },
  getMyOrders: async (): Promise<Order[]> => {
    const res = await axiosClient.get<Order[]>('/orders/my-orders')
    return res.data
  },
  getOrderById: async (id: string): Promise<Order> => {
    const res = await axiosClient.get<Order>(`/orders/${id}`)
    return res.data
  },
  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    const res = await axiosClient.post<Order>(`/orders/${id}/cancel`, { reason })
    return res.data
  },
  requestReturn: async (id: string, reason: string): Promise<Order> => {
    const res = await axiosClient.post<Order>(`/orders/${id}/return`, { reason })
    return res.data
  },
  confirmReceived: async (id: string): Promise<Order> => {
    const res = await axiosClient.put<Order>(`/orders/${id}/received`)
    return res.data
  },
  trackOrders: async (params: { orderId?: string; phone?: string }): Promise<Order[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Order[] }>('/orders/track', {
      params,
    })
    return res.data?.data ?? (res.data as unknown as Order[])
  },
  adminSearchOrders: async (params?: {
    keyword?: string
    status?: string
    paymentMethod?: string
    page?: number
    size?: number
  }): Promise<PageResponse<Order>> => {
    const res = await axiosClient.get<PageResponse<Order>>('/admin/orders', { params })
    return res.data
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
    return res.data
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
    return res.data
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
    return res.data
  },
  getUserById: async (id: string): Promise<User> => {
    const res = await axiosClient.get<User>(`/admin/users/${id}`)
    return res.data
  },
  updateUserRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await axiosClient.put<User>(`/admin/users/${id}/role`, { role })
    return res.data
  },
  updateUserStatus: async (id: string, active: boolean): Promise<User> => {
    const res = await axiosClient.patch<User>(`/admin/users/${id}/status`, { active })
    return res.data
  },
  resetPassword: async (id: string, newPassword?: string): Promise<User> => {
    const res = await axiosClient.post<User>(
      `/admin/users/${id}/reset-password`,
      newPassword ? { newPassword } : {}
    )
    return res.data
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
    return res.data
  },
  updateThreshold: async (id: string, threshold: number): Promise<Product> => {
    const res = await axiosClient.put<Product>(`/admin/inventory/${id}/threshold`, { threshold })
    return res.data
  },
  createPurchaseReceipt: async (
    data: PurchaseReceiptBatchRequest
  ): Promise<PurchaseReceipt[]> => {
    const res = await axiosClient.post<PurchaseReceipt[]>('/admin/inventory/receipts', data)
    return res.data
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
    return res.data
  },
  getReceiptDetails: async (receiptCode: string): Promise<PurchaseReceipt[]> => {
    const res = await axiosClient.get<PurchaseReceipt[]>(
      `/admin/inventory/receipts/${receiptCode}`
    )
    return res.data
  },
}

// Admin Reports APIs
export const adminReportApi = {
  getRevenueReport: async (params?: {
    from?: string
    to?: string
  }): Promise<RevenueReportResponse> => {
    const res = await axiosClient.get<RevenueReportResponse>('/admin/reports/revenue', { params })
    return res.data
  },
  getTopSelling: async (params?: {
    from?: string
    to?: string
  }): Promise<TopSellingProduct[]> => {
    const res = await axiosClient.get<TopSellingProduct[]>('/admin/reports/top-selling', { params })
    return res.data
  },
  downloadPdf: async (from?: string, to?: string): Promise<Blob> => {
    const res = await axiosClient.get('/admin/reports/export-pdf', {
      params: { from, to },
      responseType: 'blob',
    })
    return res.data
  },
  downloadCsv: async (from?: string, to?: string): Promise<string> => {
    const res = await axiosClient.get('/admin/reports/export-csv', {
      params: { from, to },
      responseType: 'text',
    })
    return res.data
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
    return res.data
  },
  updateStatus: async (id: string, status: 'RESOLVED' | 'SPAM'): Promise<ContactMessage> => {
    const res = await axiosClient.patch<ContactMessage>(`/admin/contacts/${id}/status`, { status })
    return res.data
  },
}

// Address APIs
export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await axiosClient.get<{ success: boolean; data: Address[] }>('/addresses')
    return res.data?.data ?? (res.data as unknown as Address[])
  },
  createAddress: async (data: AddressRequest): Promise<Address> => {
    const res = await axiosClient.post<{ success: boolean; data: Address }>('/addresses', data)
    return res.data?.data ?? (res.data as unknown as Address)
  },
  updateAddress: async (id: string, data: AddressRequest): Promise<Address> => {
    const res = await axiosClient.put<{ success: boolean; data: Address }>(`/addresses/${id}`, data)
    return res.data?.data ?? (res.data as unknown as Address)
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
    return res.data?.data ?? (res.data as unknown as ProductReviewSummary)
  },
  submitReview: async (productId: string, data: ProductReviewRequest): Promise<ProductReview> => {
    const res = await axiosClient.post<{ success: boolean; data: ProductReview }>(
      `/products/${productId}/reviews`,
      data
    )
    return res.data?.data ?? (res.data as unknown as ProductReview)
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
    return res.data?.data ?? (res.data as unknown as PaymentStatus)
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
    return res.data
  },
}

// Contact Public API
export const contactApi = {
  submitContact: async (data: ContactSubmitRequest): Promise<ContactMessage> => {
    const res = await axiosClient.post<{ success: boolean; data: ContactMessage }>('/contact', data)
    return res.data?.data ?? (res.data as unknown as ContactMessage)
  },
}
