import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<User>
  register: (data: RegisterRequest) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('user')
      return null
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.role?.startsWith('ROLE_')) {
        parsed.role = parsed.role.replace('ROLE_', '')
      }
      return parsed
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('token')
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('token')
      return null
    }
    return saved
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token && !user) {
      authApi
        .me()
        .then((userData) => {
          const cleanUser = {
            ...userData,
            role: (userData.role?.startsWith('ROLE_') ? userData.role.substring(5) : userData.role) as any,
          }
          setUser(cleanUser)
          localStorage.setItem('user', JSON.stringify(cleanUser))
        })
        .catch(() => {
          logout()
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = async (data: LoginRequest): Promise<User> => {
    const res = await authApi.login(data)
    const validToken = res.token || res.accessToken
    if (!validToken) {
      throw new Error('Không nhận được mã xác thực token từ hệ thống')
    }
    const cleanUser = {
      ...res.user,
      role: (res.user.role?.startsWith('ROLE_') ? res.user.role.substring(5) : res.user.role) as any,
    }
    localStorage.setItem('token', validToken)
    localStorage.setItem('user', JSON.stringify(cleanUser))
    setToken(validToken)
    setUser(cleanUser)
    return cleanUser
  }

  const register = async (data: RegisterRequest): Promise<User> => {
    await authApi.register(data)
    return await login({ email: data.email, password: data.password })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN' || (user?.role as string) === 'ROLE_ADMIN',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
