import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'

// Layouts
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

// Customer Pages
import { HomePage } from '@/features/home/HomePage'
import { ProductCatalogPage } from '@/features/products/ProductCatalogPage'
import { BmiCalculatorPage } from '@/features/tools/BmiCalculatorPage'
import { AboutPage } from '@/features/pages/AboutPage'
import { ContactPage } from '@/features/pages/ContactPage'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { OrderTrackingPage } from '@/features/orders/OrderTrackingPage'
import { PublicOrderLookupPage } from '@/features/orders/PublicOrderLookupPage'

// Auth Pages
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ProfilePage } from '@/features/auth/ProfilePage'

// Admin Pages
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminProductsPage } from '@/features/admin/AdminProductsPage'
import { AdminOrdersPage } from '@/features/admin/AdminOrdersPage'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { AdminInventoryPage } from '@/features/admin/AdminInventoryPage'
import { AdminReportsPage } from '@/features/admin/AdminReportsPage'
import { AdminContactPage } from '@/features/admin/AdminContactPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Dynamic Admin redirect based on user role to eliminate unauthorized bounces
const AdminIndexRedirect: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STAFF_WAREHOUSE') {
    return <Navigate to="/admin/inventory" replace />
  }
  if (user?.role === 'STAFF_SALES') {
    return <Navigate to="/admin/orders" replace />
  }
  return <Navigate to="/admin/dashboard" replace />
}

export const AppRoutes: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Storefront Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductCatalogPage />} />
                <Route path="/menu" element={<ProductCatalogPage />} />
                <Route path="/collections" element={<ProductCatalogPage />} />
                <Route path="/bmi-tdee" element={<BmiCalculatorPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/tracking" element={<PublicOrderLookupPage />} />

                {/* User Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderTrackingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Admin Protected Routes with RBAC */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_WAREHOUSE', 'STAFF_SALES']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminIndexRedirect />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="products"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_SALES']}>
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_WAREHOUSE']}>
                      <AdminInventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="contacts"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF_SALES']}>
                      <AdminContactPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: 'rounded-none font-sans text-xs',
            }}
          />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
