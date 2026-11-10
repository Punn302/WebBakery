import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductDetailPage } from '@/features/products/ProductDetailPage'
import { CartProvider } from '@/hooks/useCart'
import { AuthProvider } from '@/hooks/useAuth'
import React from 'react'

// Mock api
vi.mock('@/api', () => ({
  productApi: {
    getProductById: vi.fn().mockResolvedValue({
      id: 'P001',
      name: 'Combo Granola Siêu Hạt Vị Matcha HeBekery',
      description: 'Sản phẩm bánh ngũ cốc dinh dưỡng tự nhiên 100%.',
      price: 255000,
      stock: 45,
      lowStockThreshold: 5,
      imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/23.png',
      active: true,
      category: { id: 1, name: 'Granola', slug: 'granola', active: true },
      calories: 125,
      protein: 5.2,
      carbs: 16.0,
      fat: 4.1,
    }),
    getProducts: vi.fn().mockResolvedValue({
      content: [],
      totalPages: 1,
      totalElements: 0,
    }),
  },
  reviewApi: {
    getProductReviews: vi.fn().mockResolvedValue({
      reviews: [
        {
          id: 'rev-test-1',
          userName: 'Khách Hàng Mẫu',
          rating: 5,
          createdAt: '2026-11-05T12:00:00Z',
          comment: 'Bánh rất giòn thơm và ngon miệng!',
        },
      ],
      canReview: true,
      myReview: null,
      averageRating: 5.0,
      reviewCount: 1,
    }),
    submitReview: vi.fn().mockResolvedValue({
      id: 'rev-new',
      rating: 5,
      comment: 'Tuyệt vời',
    }),
  },
  cartApi: {
    getCart: vi.fn().mockResolvedValue({ items: [], totalItems: 0, totalPrice: 0 }),
    addToCart: vi.fn().mockResolvedValue({ items: [], totalItems: 0, totalPrice: 0 }),
  },
}))

describe('ProductDetailPage Hebekery Authentic Experience', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('renders product information, vouchers, gift progress and variant selector', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/products/P001']}>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    // Verify Title in breadcrumb and heading
    const titleElements = await screen.findAllByText('Combo Granola Siêu Hạt Vị Matcha HeBekery')
    expect(titleElements.length).toBeGreaterThanOrEqual(1)

    // Verify Stock Badge
    expect(screen.getByText('Còn hàng tại bếp')).toBeInTheDocument()

    // Verify Hebekery Vouchers
    expect(screen.getByText('HB5')).toBeInTheDocument()
    expect(screen.getByText('HB10')).toBeInTheDocument()
    expect(screen.getByText('HB20')).toBeInTheDocument()
    expect(screen.getByText('HB30')).toBeInTheDocument()

    // Verify Gift Progress Bar
    expect(screen.getByText(/Mua từ 249k nhận Quà tặng hấp dẫn/i)).toBeInTheDocument()

    // Verify Variant Swatches
    expect(screen.getByText('Hũ 250g')).toBeInTheDocument()
    expect(screen.getByText('Hũ 500g')).toBeInTheDocument()
    expect(screen.getByText('Combo 2 Hũ')).toBeInTheDocument()

    // Verify Brand Commitments
    expect(screen.getByText('Freeship đơn từ 299K')).toBeInTheDocument()
    expect(screen.getByText('Đổi trả 1-1 trong 7 ngày')).toBeInTheDocument()
    expect(screen.getByText('ISO 22000:2018')).toBeInTheDocument()
  })

  it('switches tabs between Mô tả, Dinh dưỡng, and Bảo quản', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/products/P001']}>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    await screen.findAllByText('Combo Granola Siêu Hạt Vị Matcha HeBekery')

    // Click Nutrition Tab
    const nutritionTab = screen.getByText('Bảng thành phần dinh dưỡng')
    fireEvent.click(nutritionTab)
    expect(screen.getByText('Chỉ tiêu dinh dưỡng chuẩn')).toBeInTheDocument()
    expect(screen.getAllByText(/Đạm \(Protein\)/i)[0]).toBeInTheDocument()

    // Click Storage Tab
    const storageTab = screen.getByText('Hướng dẫn bảo quản & Dùng')
    fireEvent.click(storageTab)
    expect(screen.getByText(/Bảo quản tốt nhất để giữ trọn độ giòn/i)).toBeInTheDocument()
  })

  it('renders reviews section and opens review modal', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/products/P001']}>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    await screen.findAllByText('Combo Granola Siêu Hạt Vị Matcha HeBekery')

    // Verify Reviews Section Header
    expect(screen.getByText('Đánh giá từ khách hàng')).toBeInTheDocument()

    // Click Write Review Button
    const writeBtn = screen.getByText('Viết đánh giá của bạn')
    fireEvent.click(writeBtn)

    // Modal should be open
    expect(screen.getByText('Mức độ hài lòng của bạn:')).toBeInTheDocument()
    expect(screen.getByText('Gửi nhận xét')).toBeInTheDocument()
  })
})
