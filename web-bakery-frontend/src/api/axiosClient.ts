import axios, { AxiosError } from 'axios'

export const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Đính kèm JWT token nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Bắt lỗi 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
