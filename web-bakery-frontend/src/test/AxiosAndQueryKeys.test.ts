import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { axiosClient, queryKeys, queryClient } from '@/api'

describe('Query Key Factory', () => {
  it('provides standardized hierarchical query keys', () => {
    expect(queryKeys.products.all).toEqual(['products'])
    expect(queryKeys.products.admin.all).toEqual(['admin-products'])
    expect(queryKeys.products.admin.list('biscotti')).toEqual(['admin-products', 'biscotti'])
    expect(queryKeys.products.categories).toEqual(['categories'])

    expect(queryKeys.orders.myOrders()).toEqual(['my-orders'])
    expect(queryKeys.orders.admin.all).toEqual(['admin-orders'])
    expect(queryKeys.orders.admin.list('HBK123', 'PENDING')).toEqual(['admin-orders', 'HBK123', 'PENDING'])

    expect(queryKeys.inventory.admin.all).toEqual(['admin-inventory'])
    expect(queryKeys.inventory.admin.list('grain', 1)).toEqual(['admin-inventory', 'grain', 1])
    expect(queryKeys.inventory.admin.batches('P001', 'ACTIVE', 0)).toEqual(['admin-batches', 'P001', 'ACTIVE', 0])
    expect(queryKeys.inventory.admin.batchStats()).toEqual(['admin-batch-stats'])

    expect(queryKeys.vouchers.all).toEqual(['vouchers'])
    expect(queryKeys.vouchers.available()).toEqual(['available-vouchers'])
    expect(queryKeys.vouchers.admin.all).toEqual(['admin-vouchers'])

    expect(queryKeys.profile.loyalty()).toEqual(['loyalty-profile'])
    expect(queryKeys.profile.addresses()).toEqual(['user-addresses'])
  })
})

describe('Axios Silent Token Refresh', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('attaches Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'sample-jwt-token')

    // Create a mock adapter or interceptor test
    const config = await (axiosClient.interceptors.request as any).handlers[0].fulfilled({
      headers: {},
    })

    expect(config.headers.Authorization).toBe('Bearer sample-jwt-token')
  })

  it('clears credentials and queryClient on 401 when no refreshToken exists', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@hebekery.vn' }))
    const clearSpy = vi.spyOn(queryClient, 'clear')

    const mockError = {
      response: { status: 401 },
      config: { url: '/orders', headers: {} },
    }

    const errorHandler = (axiosClient.interceptors.response as any).handlers[0].rejected
    await expect(errorHandler(mockError)).rejects.toBeDefined()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('performs silent token refresh on 401 and updates localStorage', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refreshToken', 'valid-refresh-token')

    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          accessToken: 'brand-new-access-token',
          refreshToken: 'brand-new-refresh-token',
        },
      },
    })

    // Mock axiosClient adapter to prevent actual network call in JSDOM
    const originalAdapter = axiosClient.defaults.adapter
    axiosClient.defaults.adapter = async (cfg) => ({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: cfg,
    })

    const mockError = {
      response: { status: 401 },
      config: { url: '/products', headers: {} },
    }

    const errorHandler = (axiosClient.interceptors.response as any).handlers[0].rejected
    await errorHandler(mockError)

    expect(postSpy).toHaveBeenCalledWith('/api/auth/refresh-token', {
      refreshToken: 'valid-refresh-token',
    })
    expect(localStorage.getItem('token')).toBe('brand-new-access-token')
    expect(localStorage.getItem('refreshToken')).toBe('brand-new-refresh-token')

    axiosClient.defaults.adapter = originalAdapter
  })

  it('queues simultaneous 401 requests and only calls refresh endpoint once', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refreshToken', 'valid-refresh-token')

    let resolveRefresh: (val: any) => void = () => {}
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve
    })

    const postSpy = vi.spyOn(axios, 'post').mockReturnValueOnce(refreshPromise as any)

    const originalAdapter = axiosClient.defaults.adapter
    axiosClient.defaults.adapter = async (cfg) => ({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: cfg,
    })

    const errorHandler = (axiosClient.interceptors.response as any).handlers[0].rejected

    const req1 = { response: { status: 401 }, config: { url: '/req1', headers: {} } }
    const req2 = { response: { status: 401 }, config: { url: '/req2', headers: {} } }

    const p1 = errorHandler(req1)
    const p2 = errorHandler(req2)

    // Check that post was only called once
    expect(postSpy).toHaveBeenCalledTimes(1)

    // Now resolve refresh
    resolveRefresh({
      data: {
        success: true,
        data: {
          accessToken: 'queued-new-token',
          refreshToken: 'queued-new-refresh',
        },
      },
    })

    const [res1, res2] = await Promise.all([p1, p2])
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('token')).toBe('queued-new-token')

    axiosClient.defaults.adapter = originalAdapter
  })
})
