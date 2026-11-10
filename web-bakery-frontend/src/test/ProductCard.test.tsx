import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from '@/features/products/ProductCard'
import type { Product } from '@/types'

// Mock useCart hook
const mockAddItem = vi.fn()
vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}))

describe('ProductCard Component', () => {
  const dummyProduct: Product = {
    id: 'P001',
    name: 'Bánh Mì Đen Nguyên Cám',
    description: 'Bánh mì đen lúa mạch hữu cơ, giàu chất xơ.',
    price: 65000,
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    active: true,
    lowStockThreshold: 5,
    calories: 220,
    category: {
      id: 1,
      name: 'Bánh ăn kiêng',
      slug: 'banh-an-kieng',
      active: true,
    },
  }

  it('renders product details correctly (name, price in VND, category, calories)', () => {
    render(<MemoryRouter><ProductCard product={dummyProduct} /></MemoryRouter>)

    expect(screen.getByText('Bánh Mì Đen Nguyên Cám')).toBeInTheDocument()
    expect(screen.getByText('Bánh ăn kiêng')).toBeInTheDocument()
    expect(screen.getByText('220 kcal')).toBeInTheDocument()
    // Giá định dạng tiền tệ VND
    expect(screen.getByText(/65\.000/)).toBeInTheDocument()
  })

  it('calls addItem when clicking "Thêm" button', async () => {
    render(<MemoryRouter><ProductCard product={dummyProduct} /></MemoryRouter>)

    const addButton = screen.getByRole('button', { name: /Thêm/i })
    await act(async () => {
      fireEvent.click(addButton)
    })

    expect(mockAddItem).toHaveBeenCalledWith(dummyProduct, 1)
  })

  it('shows out of stock badge when stock is 0', () => {
    const outOfStockProduct: Product = {
      ...dummyProduct,
      stock: 0,
    }
    render(<MemoryRouter><ProductCard product={outOfStockProduct} /></MemoryRouter>)

    expect(screen.getByText(/Tạm hết hàng/i)).toBeInTheDocument()
  })
})
