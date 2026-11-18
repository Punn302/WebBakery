import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import React from 'react'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'admin@hebekery.vn', role: 'ADMIN', name: 'Hebekery Chef' },
    isAuthenticated: true,
  }),
}))

describe('AdminLayout Mobile Responsive Sidebar', () => {
  it('renders desktop sidebar and mobile hamburger toggle button', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout />
      </MemoryRouter>
    )

    // Check hamburger toggle button exists
    const toggleBtn = screen.getByRole('button', { name: /Mở menu quản trị/i })
    expect(toggleBtn).toBeInTheDocument()

    // Open mobile drawer
    fireEvent.click(toggleBtn)

    // Check that close button appears inside the drawer
    const closeBtn = screen.getByRole('button', { name: /Đóng thanh điều hướng/i })
    expect(closeBtn).toBeInTheDocument()

    // Clicking close button dismisses mobile drawer
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('button', { name: /Đóng thanh điều hướng/i })).not.toBeInTheDocument()
  })
})
