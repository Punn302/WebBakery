import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from '@/features/products/ProductCard'
import type { Product } from '@/types'

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: vi.fn(),
  }),
}))

vi.mock('@/hooks/useWishlist', () => ({
  useWishlist: () => ({
    isInWishlist: () => false,
    toggleWishlist: vi.fn(),
  }),
}))

const mockProduct: Product = {
  id: 'P001',
  name: 'Bánh Biscotti Nguyên Cám Hạnh Nhân',
  description: 'Bánh ăn kiêng healthy giòn rụm',
  price: 150000,
  stock: 25,
  imageUrl: 'https://example.com/biscotti.jpg',
  active: true,
  lowStockThreshold: 5,
}

describe('Hướng 2 & 3: Loyalty & Near-Expiry Flash Sale Components', () => {
  it('renders ProductCard with standard sale badge when no near-expiry deal is provided', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    )

    expect(screen.getByText('Bánh Biscotti Nguyên Cám Hạnh Nhân')).toBeInTheDocument()
    expect(screen.getByText('-15%')).toBeInTheDocument()
  })

  it('renders ProductCard with "Cứu Bánh -35%" badge and remaining days when dealBadge is active', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={mockProduct}
          dealBadge={{ discountPercent: 35, daysRemaining: 20 }}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Bánh Biscotti Nguyên Cám Hạnh Nhân')).toBeInTheDocument()
    expect(screen.getByText(/Cứu Bánh -35%/i)).toBeInTheDocument()
    expect(screen.getByText(/HSD: 20 ngày/i)).toBeInTheDocument()
    // Discounted price 150,000 * 65% = 97,500đ
    expect(screen.getByText(/98\.000/)).toBeInTheDocument()
  })
})
