import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/hooks/useCart'
import type { Product } from '@/types'
import React from 'react'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useCart Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const dummyProduct1: Product = {
    id: 'P001',
    name: 'Bánh Mì Đen',
    description: '',
    price: 50000,
    stock: 10,
    imageUrl: '',
    active: true,
    lowStockThreshold: 2,
  }

  const dummyProduct2: Product = {
    id: 'P002',
    name: 'Granola Siêu Hạt',
    description: '',
    price: 120000,
    stock: 15,
    imageUrl: '',
    active: true,
    lowStockThreshold: 3,
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.totalItems).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('adds item to cart and calculates subtotal correctly', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem(dummyProduct1, 2)
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].productId).toBe('P001')
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.totalItems).toBe(2)
    expect(result.current.subtotal).toBe(100000)

    // Thêm sản phẩm thứ 2
    await act(async () => {
      await result.current.addItem(dummyProduct2, 1)
    })

    expect(result.current.items.length).toBe(2)
    expect(result.current.totalItems).toBe(3)
    expect(result.current.subtotal).toBe(220000)
  })

  it('removes item from cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem(dummyProduct1, 2)
      await result.current.addItem(dummyProduct2, 1)
    })

    expect(result.current.items.length).toBe(2)

    await act(async () => {
      await result.current.removeItem('P001')
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].productId).toBe('P002')
    expect(result.current.subtotal).toBe(120000)
  })
})
