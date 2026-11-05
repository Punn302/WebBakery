import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressSelector } from '@/components/common/AddressSelector'
import { PublicOrderLookupPage } from '@/features/orders/PublicOrderLookupPage'
import type { Address, Order } from '@/types'
import React from 'react'

// Mock addressApi
vi.mock('@/api', () => ({
  addressApi: {
    getAddresses: vi.fn().mockResolvedValue([
      {
        id: 'addr-1',
        userId: 'u1',
        receiverName: 'Nguyễn Văn A',
        phone: '0912345678',
        addressLine: '123 Đường Bánh Mì',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        fullAddress: '123 Đường Bánh Mì, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        defaultAddress: true,
      },
      {
        id: 'addr-2',
        userId: 'u1',
        receiverName: 'Nguyễn Văn B (Văn phòng)',
        phone: '0987654321',
        addressLine: '456 Đường Eat Clean',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường 6',
        fullAddress: '456 Đường Eat Clean, Phường 6, Quận 3, TP. Hồ Chí Minh',
        defaultAddress: false,
      },
    ] as Address[]),
  },
  orderApi: {
    trackOrders: vi.fn().mockResolvedValue([
      {
        id: 'order-1',
        orderCode: 'HBK-9999',
        customerName: 'Khách Hàng Thân Thiết',
        phone: '0912345678',
        address: '123 Đường Bánh Mì, TP. Hồ Chí Minh',
        paymentMethod: 'VIETQR',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        total: 150000,
        createdAt: '2026-11-05T10:00:00Z',
        items: [
          {
            productId: 'P001',
            productName: 'Bánh Mì Đen Nguyên Cám',
            price: 50000,
            quantity: 3,
            total: 150000,
            imageUrl: '',
          },
        ],
      },
    ] as Order[]),
  },
  reviewApi: {
    getProductReviews: vi.fn().mockResolvedValue({
      reviews: [],
      canReview: true,
      myReview: null,
      averageRating: 5.0,
      reviewCount: 0,
    }),
  },
}))

describe('Customer Experience Components (Task C)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('renders AddressSelector with saved addresses and allows selection', async () => {
    const handleSelect = vi.fn()
    const handleSelectManual = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <AddressSelector
          selectedAddressId="addr-1"
          onSelectAddress={handleSelect}
          onSelectManual={handleSelectManual}
          isManualSelected={false}
        />
      </QueryClientProvider>
    )

    // Wait for address items to appear
    const addr1 = await screen.findByText('Nguyễn Văn A')
    expect(addr1).toBeInTheDocument()

    const addr2 = screen.getByText('Nguyễn Văn B (Văn phòng)')
    expect(addr2).toBeInTheDocument()

    // Click on second address
    fireEvent.click(addr2)
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'addr-2', receiverName: 'Nguyễn Văn B (Văn phòng)' })
    )

    // Option to enter manual address
    const manualBtn = screen.getByText('Giao đến địa chỉ mới khác')
    fireEvent.click(manualBtn)
    expect(handleSelectManual).toHaveBeenCalled()
  })

  it('renders PublicOrderLookupPage and displays order tracking progress', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PublicOrderLookupPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Tra Cứu Đơn Hàng Công Khai')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Nhập mã đơn hàng hoặc SĐT đặt hàng...')
    expect(input).toBeInTheDocument()

    // Type order code and submit
    fireEvent.change(input, { target: { value: 'HBK-9999' } })
    const submitBtn = screen.getByRole('button', { name: /Tra cứu/i })
    fireEvent.click(submitBtn)

    // Wait for order result to appear
    const orderHeader = await screen.findByText('#HBK-9999')
    expect(orderHeader).toBeInTheDocument()
    expect(screen.getByText('Đang làm bánh')).toBeInTheDocument()
    expect(screen.getByText('Bánh Mì Đen Nguyên Cám')).toBeInTheDocument()
  })
})
