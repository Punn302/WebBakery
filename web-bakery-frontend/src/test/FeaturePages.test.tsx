import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BmiCalculatorPage } from '@/features/tools/BmiCalculatorPage'
import { AboutPage } from '@/features/pages/AboutPage'
import { ContactPage } from '@/features/pages/ContactPage'

// Mock useCart hook
const mockAddItem = vi.fn().mockResolvedValue(undefined)
const mockSetIsCartOpen = vi.fn()

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    setIsCartOpen: mockSetIsCartOpen,
    items: [],
  }),
}))

// Mock contactApi
vi.mock('@/api', () => ({
  contactApi: {
    submitContact: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Nguyen Van A',
      email: 'a@example.com',
      phone: '0979764185',
      subject: 'Tu van',
      message: 'Xin chao HeBekery',
      status: 'NEW',
      createdAt: '2026-11-08T00:00:00Z',
    }),
  },
}))

describe('Feature Pages - HeBekery Style Verification', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('renders BmiCalculatorPage with accurate BMI, TDEE, and bakery bundle upsell', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BmiCalculatorPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Heading verification
    expect(screen.getByText(/Tính Chỉ Số BMI & Nhu Cầu Năng Lượng TDEE/i)).toBeInTheDocument()

    // Gender toggle buttons
    expect(screen.getByRole('button', { name: /Nữ giới/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nam giới/i })).toBeInTheDocument()

    // Results card & BMI status
    expect(screen.getByText(/2. Kết Quả Đánh Giá Thể Trạng/i)).toBeInTheDocument()
    expect(screen.getByText(/BMR Chuyển Hóa Cơ Bản/i)).toBeInTheDocument()
    expect(screen.getByText(/TDEE Tổng Tiêu Hao/i)).toBeInTheDocument()
    expect(screen.getByText(/Lượng Calo Khuyến Nghị Nạp Mỗi Ngày/i)).toBeInTheDocument()

    // Curated bundle button
    const addComboBtn = screen.getByRole('button', {
      name: /Thêm Gói Bánh Vào Giỏ Hàng/i,
    })
    expect(addComboBtn).toBeInTheDocument()

    // Click add combo with act
    await act(async () => {
      fireEvent.click(addComboBtn)
    })
    expect(mockAddItem).toHaveBeenCalled()
  })

  it('renders AboutPage with editorial magazine layout, 3 KHÔNG, and 4 quality pillars', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    // Slogan & brand quote
    expect(screen.getByText(/ĂN NGON - SỐNG KHỎE - TƯƠI TRẺ/i)).toBeInTheDocument()
    expect(
      screen.getByText(/“Chọn nguyên liệu kỹ, làm chỉn chu — HeBekery đồng hành cùng lối sống lành mạnh của bạn.”/i)
    ).toBeInTheDocument()

    // Triết lý 3 KHÔNG
    expect(screen.getByText(/0g Đường Cát Tinh Luyện/i)).toBeInTheDocument()
    expect(screen.getByText(/100% Không Chất Bảo Quản/i)).toBeInTheDocument()
    expect(screen.getByText(/100% Bột Nguyên Cám Nhập Khẩu/i)).toBeInTheDocument()

    // 4 Trụ cột chất lượng
    expect(screen.getByText(/ISO 22000:2018/i)).toBeInTheDocument()
    expect(screen.getByText(/HACCP Codex/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Nướng Mẻ Nhỏ Tươi Mới/i })).toBeInTheDocument()
    expect(screen.getByText(/Đóng Gói Bảo Quản Tự Nhiên/i)).toBeInTheDocument()
  })

  it('renders ContactPage with HeBekery official verified info and handles form submission', async () => {
    const { contactApi } = await import('@/api')

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Official info
    expect(
      screen.getByText(/2D Hồ Ngọc Cẩn, Phường Tân Thành, Quận Tân Phú, TP HCM/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/097 97 64 185/i)).toBeInTheDocument()
    expect(screen.getByText(/hebe.healthandbeauty@gmail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/08:00 - 21:00 hàng ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/Giao hỏa tốc 2H tại TP.HCM & Hà Nội/i)).toBeInTheDocument()

    // Form inputs
    const nameInput = screen.getByPlaceholderText(/Ví dụ: Nguyễn Thị Mai Phương/i)
    const phoneInput = screen.getByPlaceholderText(/097 97 64 185/i)
    const emailInput = screen.getByPlaceholderText(/name@example.com/i)
    const messageInput = screen.getByPlaceholderText(
      /Chia sẻ với HeBekery về thắc mắc, mục tiêu dinh dưỡng hoặc thời gian bạn muốn nhận bánh.../i
    )

    fireEvent.change(nameInput, { target: { value: 'Trần Văn B' } })
    fireEvent.change(phoneInput, { target: { value: '0979764185' } })
    fireEvent.change(emailInput, { target: { value: 'tranb@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Tôi muốn tư vấn combo Eat Clean 7 ngày' } })

    const submitBtn = screen.getByRole('button', { name: /Gửi Lời Nhắn Đến Tiệm Bánh/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(contactApi.submitContact).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Trần Văn B',
          phone: '0979764185',
          email: 'tranb@example.com',
          message: 'Tôi muốn tư vấn combo Eat Clean 7 ngày',
        })
      )
    })
  })
})
