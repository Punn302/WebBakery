/**
 * Format số tiền VND
 * Ví dụ: 150000 -> 150.000 ₫
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format ngày giờ hiển thị
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateString
  }
}

/**
 * Tối ưu URL hình ảnh Cloudinary với auto format, chất lượng tự động và chiều rộng
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, width = 600): string {
  if (!url) return '/placeholder-bakery.png'
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url
  }
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}
