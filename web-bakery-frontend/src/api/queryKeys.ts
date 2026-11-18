/**
 * Hierarchical Query Key Factory for HeBekery
 * Standardizes TanStack Query cache keys and selective invalidation across all features.
 */

export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.products.lists(), params] as const,
    bestseller: () => [...queryKeys.products.all, 'bestseller'] as const,
    catalog: (page?: number) => [...queryKeys.products.all, 'catalog', page] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.products.details(), id] as const,
    reviews: (id: string | number) => [...queryKeys.products.all, 'reviews', id] as const,
    related: (categoryId: unknown) => [...queryKeys.products.all, 'related', categoryId] as const,
    flashDeals: () => [...queryKeys.products.all, 'flash-deals'] as const,
    admin: {
      all: ['admin-products'] as const,
      list: (keyword?: string) => ['admin-products', keyword] as const,
      summary: () => ['admin-products-summary'] as const,
    },
    categories: ['categories'] as const,
    adminCategories: (keyword?: string, page?: number) => ['admin-categories', keyword, page] as const,
  },

  orders: {
    all: ['orders'] as const,
    myOrders: () => ['my-orders'] as const,
    detail: (id: string | number) => ['orders', id] as const,
    success: (id: string | number) => ['order-success', id] as const,
    admin: {
      all: ['admin-orders'] as const,
      list: (keyword?: string, statusFilter?: string) => ['admin-orders', keyword, statusFilter] as const,
      summary: () => ['admin-orders-summary'] as const,
      unpaid: () => ['admin-unpaid-orders'] as const,
      reports: (from?: string, to?: string) => ['admin-revenue-report', from, to] as const,
    },
  },

  inventory: {
    all: ['inventory'] as const,
    admin: {
      all: ['admin-inventory'] as const,
      list: (keyword?: string, page?: number) => ['admin-inventory', keyword, page] as const,
      receipts: (page?: number) => ['admin-purchase-receipts', page] as const,
      receiptDetail: (code?: string) => ['admin-receipt-details', code] as const,
      batches: (productId?: string, status?: string, page?: number) =>
        ['admin-batches', productId, status, page] as const,
      batchStats: () => ['admin-batch-stats'] as const,
      productsForReceipt: () => ['admin-all-products-for-receipt'] as const,
    },
  },

  vouchers: {
    all: ['vouchers'] as const,
    available: () => ['available-vouchers'] as const,
    profile: () => ['profile-vouchers'] as const,
    admin: {
      all: ['admin-vouchers'] as const,
      summary: () => ['admin-vouchers-summary'] as const,
    },
  },

  profile: {
    all: ['profile'] as const,
    addresses: () => ['user-addresses'] as const,
    loyalty: () => ['loyalty-profile'] as const,
    loyaltyTransactions: () => ['loyalty-transactions'] as const,
    loyaltyTiers: () => ['loyalty-tiers'] as const,
  },
} as const
