import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#47654c] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = user.role?.startsWith('ROLE_') ? user.role.substring(5) : user.role

  // Admin has superuser access to all protected modules
  if (role === 'ADMIN' || user.role === 'ADMIN') {
    return <>{children}</>
  }

  // Check against allowed roles list
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(
      (r) => r === role || `ROLE_${r}` === user.role || r === user.role
    )
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  // Check against single required role
  if (requiredRole && role !== requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
