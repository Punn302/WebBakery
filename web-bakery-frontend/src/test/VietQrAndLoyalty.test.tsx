import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VietQrPaymentModal } from '@/components/common/VietQrPaymentModal'
import type { Order } from '@/types'
import React from 'react'

vi.mock('@/api', () => ({
  paymentApi: {
    getOrderPaymentStatus: vi.fn().mockResolvedValue({ isPaid: false }),
  },
}))

describe('VietQrPaymentModal Component', () => {
  const mockOrder: Order = {
    id: 'HBK-9999',
    orderCode: 'HBK9999',
    userId: 'U001',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Lê Lợi, Q1, TP.HCM',
    total: 250000,
    subtotal: 220000,
    shippingFee: 30000,
    discountAmount: 0,
    pointsDiscountAmount: 0,
    inventoryDeducted: true,
    paymentMethod: 'VIETQR',
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    items: [],
    createdAt: new Date().toISOString(),
  }

  it('renders MBBank account details and unified 0979764185 number', () => {
    render(
      <VietQrPaymentModal
        order={mockOrder}
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText(/0979764185/)).toBeInTheDocument()
    expect(screen.getByText(/MBBank/i)).toBeInTheDocument()
    expect(screen.getByText(/HeBekery Healthy Bakery/i)).toBeInTheDocument()
    expect(screen.getAllByText(/HBK9999/).length).toBeGreaterThanOrEqual(1)
  })
})
