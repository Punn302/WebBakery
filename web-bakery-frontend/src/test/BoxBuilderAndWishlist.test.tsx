import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BoxBuilderPage } from '@/features/tools/BoxBuilderPage'
import { AdminCategoriesPage } from '@/features/admin/AdminCategoriesPage'
import { WishlistProvider, useWishlist } from '@/hooks/useWishlist'
import { WishlistDrawer } from '@/components/common/WishlistDrawer'

// Mock useCart hook
const mockAddItem = vi.fn().mockResolvedValue({})
const mockSetIsCartOpen = vi.fn()
vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    setIsCartOpen: mockSetIsCartOpen,
    totalItems: 0,
    items: [],
  }),
}))

// Mock APIs
vi.mock('@/api', () => ({
  categoryApi: {
    adminGetCategories: vi.fn().mockResolvedValue({
      content: [
        {
          id: 1,
          name: 'Biscotti Nguyên Cám',
          slug: 'biscotti-nguyen-cam',
          description: 'Dòng bánh ăn kiêng không đường tinh luyện',
          active: true,
          productCount: 8,
        },
        {
          id: 2,
          name: 'Hạt Ngũ Cốc Granola',
          slug: 'granola',
          description: 'Granola nướng mật ong hoa nhãn',
          active: true,
          productCount: 4,
        },
      ],
      totalPages: 1,
      totalElements: 2,
      size: 10,
      number: 0,
    }),
    adminCreateCategory: vi.fn().mockResolvedValue({ id: 3, name: 'Bánh Mới', slug: 'banh-moi', active: true }),
    adminUpdateCategory: vi.fn().mockResolvedValue({ id: 1, name: 'Biscotti Updated', slug: 'biscotti-updated', active: true }),
    adminDeleteCategory: vi.fn().mockResolvedValue({}),
  },
}))

describe('Direction 2: Custom Mix-and-Match Box Builder', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders box size selection and flavor catalog', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BoxBuilderPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText(/Tự Phối Hộp Bánh Mix Vị HeBekery/i)).toBeInTheDocument()
    expect(screen.getByText('Hộp Tiêu Chuẩn 4 Vị')).toBeInTheDocument()
    expect(screen.getByText('Hộp Quà Cao Cấp 6 Vị')).toBeInTheDocument()
    expect(screen.getAllByText('Biscotti Trái Cây & Hạt').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Biscotti Chocolate Đen 70%').length).toBeGreaterThan(0)
    expect(screen.getByText('Granola Mật Ong Hoa Nhãn')).toBeInTheDocument()
  })

  it('switches between 4-slot and 6-slot boxes', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BoxBuilderPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Initially 4 slots with 2 sample items pre-filled
    expect(screen.getByText('2/4 ngăn')).toBeInTheDocument()

    // Switch to 6 slots
    const box6Btn = screen.getByText('Hộp Quà Cao Cấp 6 Vị')
    fireEvent.click(box6Btn)
    expect(screen.getByText('2/6 ngăn')).toBeInTheDocument()
  })

  it('adds flavors to slots and enables checkout button when box is complete', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BoxBuilderPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Button should be disabled initially (needs 2 more flavors for 4-slot box)
    expect(screen.getByText(/Chọn thêm 2 vị để hoàn tất/i)).toBeInTheDocument()

    // Click flavor 2 times to fill remaining 2 slots
    const honeyGranola = screen.getByText('Granola Mật Ong Hoa Nhãn')
    fireEvent.click(honeyGranola)
    expect(screen.getByText('3/4 ngăn')).toBeInTheDocument()

    fireEvent.click(honeyGranola)

    // Box is now full (4/4)
    expect(screen.getByText('4/4 ngăn')).toBeInTheDocument()
    const addBoxBtn = screen.getByText(/Thêm Hộp Bánh Vào Giỏ Hàng/i)
    expect(addBoxBtn).toBeInTheDocument()

    fireEvent.click(addBoxBtn)
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled()
      expect(mockSetIsCartOpen).toHaveBeenCalledWith(true)
    })
  })
})

describe('Direction 3: Wishlist Hub & Admin Categories', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('Wishlist drawer displays items and triggers actions', async () => {
    const TestComponent: React.FC = () => {
      const { toggleWishlist } = useWishlist()
      return (
        <div>
          <button
            onClick={() =>
              toggleWishlist({
                id: 'P-WISH-1',
                name: 'Bánh Ngói Hạnh Nhân Phô Mai',
                slug: 'banh-ngoi-hanh-nhan',
                price: 185000,
                imageUrl: '/sample.jpg',
                category: { id: 1, name: 'Bánh ngói', slug: 'banh-ngoi', active: true },
                stock: 10,
              } as any)
            }
          >
            Thêm Yêu Thích
          </button>
          <WishlistDrawer isOpen={true} onClose={() => {}} />
        </div>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <WishlistProvider>
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </WishlistProvider>
      </QueryClientProvider>
    )

    // Initially empty
    expect(screen.getByText(/Chưa Có Bánh Nào Được Lưu/i)).toBeInTheDocument()

    // Add item
    fireEvent.click(screen.getByText('Thêm Yêu Thích'))
    await waitFor(() => {
      expect(screen.getByText('Bánh Ngói Hạnh Nhân Phô Mai')).toBeInTheDocument()
      expect(screen.getByText(/185\.000/i)).toBeInTheDocument()
    })
  })

  it('AdminCategoriesPage renders categories table with management actions', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCategoriesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Biscotti Nguyên Cám')).toBeInTheDocument()
      expect(screen.getByText('Hạt Ngũ Cốc Granola')).toBeInTheDocument()
      expect(screen.getByText('biscotti-nguyen-cam')).toBeInTheDocument()
    })

    // Create Category Button is present
    expect(screen.getByText(/Thêm Danh Mục Mới/i)).toBeInTheDocument()
  })
})
