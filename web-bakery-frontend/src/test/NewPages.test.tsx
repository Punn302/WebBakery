import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PolicyPage } from '@/features/pages/PolicyPage'
import { FaqPage } from '@/features/pages/FaqPage'
import { VouchersPage } from '@/features/vouchers/VouchersPage'
import { OrderSuccessPage } from '@/features/checkout/OrderSuccessPage'

// Mock APIs
vi.mock('@/api', () => ({
  voucherApi: {
    getAvailable: vi.fn().mockResolvedValue([
      {
        id: 'VOUCHER-HB10',
        code: 'HB10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderAmount: 150000,
        usageLimit: 500,
        usedCount: 12,
        active: true,
      },
      {
        id: 'VOUCHER-FREESHIP',
        code: 'FREESHIP',
        discountType: 'FREE_SHIPPING',
        discountValue: 30000,
        minOrderAmount: 200000,
        usageLimit: 1000,
        usedCount: 85,
        active: true,
      },
    ]),
  },
  orderApi: {
    getOrderById: vi.fn().mockResolvedValue({
      id: 'ORD-99999',
      customerName: 'Nguyễn Văn Hebekery',
      phone: '0987654321',
      address: '123 Hồ Ngọc Cẩn, Tân Phú, TP.HCM',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      total: 320000,
      shippingFee: 0,
      discountAmount: 30000,
      voucherCode: 'HB10',
      items: [
        {
          id: 1,
          productId: 'P001',
          productName: 'Bánh Biscotti Truyền Thống',
          imageUrl: '/biscotti.jpg',
          price: 175000,
          quantity: 2,
          total: 350000,
        },
      ],
      createdAt: '2026-11-10T15:00:00Z',
    }),
    trackOrders: vi.fn().mockResolvedValue([]),
  },
}))

describe('New Brand Pages & Customer Experience', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('renders PolicyPage and switches between Return and Shipping tabs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/policy?tab=return']}>
          <PolicyPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText(/Chính Sách & Quyền Lợi Khách Hàng/i)).toBeInTheDocument()
    expect(screen.getByText(/Chính Sách Đổi Trả 1-1 Trong Vòng 7 Ngày/i)).toBeInTheDocument()

    // Switch tab to Shipping
    const shippingTab = screen.getByRole('button', { name: /Vận chuyển & Freeship/i })
    fireEvent.click(shippingTab)
    expect(screen.getByText(/Chính Sách Vận Chuyển & Giao Hàng Toàn Quốc/i)).toBeInTheDocument()
    expect(screen.getByText(/Miễn Phí Vận Chuyển Toàn Quốc Cho Đơn Hàng Từ 299.000đ/i)).toBeInTheDocument()
  })

  it('renders FaqPage and searches FAQs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/faq']}>
          <FaqPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText(/Câu Hỏi Thường Gặp \(FAQ\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Bánh Biscotti Hebekery để được bao lâu/i)).toBeInTheDocument()

    // Filter by search
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm: calo, hạn sử dụng, freeship/i)
    fireEvent.change(searchInput, { target: { value: 'tiểu đường' } })
    expect(
      screen.getByText(/Người bị tiểu đường hoặc phụ nữ mang thai có dùng bánh được không/i)
    ).toBeInTheDocument()
  })

  it('renders VouchersPage with available coupons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/vouchers']}>
          <VouchersPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('HB10')).toBeInTheDocument()
      expect(screen.getAllByText('FREESHIP').length).toBeGreaterThan(0)
    })

    expect(
      screen.getByText(/Tự Động Miễn Phí Vận Chuyển Cho Đơn Từ 299.000đ/i)
    ).toBeInTheDocument()
  })

  it('renders OrderSuccessPage with order breakdown and details', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/order-success/ORD-99999']}>
          <Routes>
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Cảm Ơn Bạn Đã Chọn Bánh Lành HeBekery!/i)).toBeInTheDocument()
      expect(screen.getByText('#ORD-99999')).toBeInTheDocument()
      expect(screen.getByText('Bánh Biscotti Truyền Thống')).toBeInTheDocument()
      expect(screen.getByText(/123 Hồ Ngọc Cẩn, Tân Phú, TP.HCM/i)).toBeInTheDocument()
      expect(screen.getByText(/Miễn phí \(Freeship 299k\)/i)).toBeInTheDocument()
    })
  })
})
