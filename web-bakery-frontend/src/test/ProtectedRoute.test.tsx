import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import React from 'react'

let mockAuth = {
  isAuthenticated: false,
  isLoading: false,
  user: null as { id: string; email: string; name: string; role: string } | null,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}))

describe('ProtectedRoute RBAC Logic', () => {
  beforeEach(() => {
    mockAuth = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    }
  })

  it('redirects to /login when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_SALES']}>
                <div>Protected Orders Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Orders Content')).not.toBeInTheDocument()
  })

  it('renders content when user has the exact allowed role', () => {
    mockAuth = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1', email: 'sales@hebekery.vn', name: 'Sales Staff', role: 'STAFF_SALES' },
    }

    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_SALES']}>
                <div>Protected Orders Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Orders Content')).toBeInTheDocument()
  })

  it('redirects unauthorized role to / when role is not in allowedRoles', () => {
    mockAuth = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u2', email: 'sales@hebekery.vn', name: 'Sales Staff', role: 'STAFF_SALES' },
    }

    render(
      <MemoryRouter initialEntries={['/admin/inventory']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_WAREHOUSE']}>
                <div>Protected Warehouse Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Warehouse Content')).not.toBeInTheDocument()
  })

  it('allows ADMIN superuser to access any admin route regardless of specific role restrictions', () => {
    mockAuth = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'admin1', email: 'admin@hebekery.vn', name: 'Admin Boss', role: 'ADMIN' },
    }

    render(
      <MemoryRouter initialEntries={['/admin/inventory']}>
        <Routes>
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRoles={['STAFF_WAREHOUSE']}>
                <div>Protected Warehouse Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Warehouse Content')).toBeInTheDocument()
  })
})
