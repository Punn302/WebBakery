import { axiosClient } from './axiosClient'
import type {
  User,
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
