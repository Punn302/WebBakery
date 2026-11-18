import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { queryClient } from './queryClient'

export const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token if present
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

interface RetryQueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: RetryQueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error)
    } else if (token) {
      item.resolve(token)
    }
  })
  failedQueue = []
}

const clearAuthAndRedirect = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  queryClient.clear()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Response Interceptor: Silent Token Refresh on 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not attempt refresh on auth endpoints to prevent loops
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        return Promise.reject(error)
      }

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Raw axios instance to bypass axiosClient interceptor
        const res = await axios.post('/api/auth/refresh-token', { refreshToken })
        const resData = res.data?.data || res.data
        const newAccessToken = resData?.accessToken || resData?.token
        const newRefreshToken = resData?.refreshToken || refreshToken

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint')
        }

        localStorage.setItem('token', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        processQueue(null, newAccessToken)
        return axiosClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
