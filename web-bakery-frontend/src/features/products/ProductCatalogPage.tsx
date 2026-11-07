import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { productApi, categoryApi } from '@/api'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductDetailModal } from './ProductDetailModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const ProductCatalogPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [selectedDiet, setSelectedDiet] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Lấy danh mục
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000,
  })

  // Lấy danh sách sản phẩm phân trang
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', { keyword, categoryId: selectedCategory, page }],
    queryFn: () =>
      productApi.getProducts({
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategory,
        page,
        size: 12,
        activeOnly: true,
      }),
    staleTime: 2 * 60 * 1000,
  })

  const rawProducts = productData?.content || []
  const totalPages = productData?.totalPages || 0

  // Filter client-side by dietary preference if set
  const products = rawProducts.filter((product) => {
    if (selectedDiet === 'all') return true
    if (selectedDiet === 'no_sugar') {
      return (
        product.description?.toLowerCase().includes('không đường') ||
        product.name.toLowerCase().includes('mật ong') ||
        product.name.toLowerCase().includes('sourdough')
      )
    }
    if (selectedDiet === 'high_protein') {
      return (product.protein && product.protein >= 10) || product.name.toLowerCase().includes('hạt')
    }
    if (selectedDiet === 'low_carb') {
      return product.name.toLowerCase().includes('biscotti') || (product.calories && product.calories <= 180)
    }
    return true
  })

  return (
    <div className="space-y-10 pb-12">
      {/* ================= Breadcrumb & Hero Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#eadbce] p-8 sm:p-10 tactile-card space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#78716c]">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-[#4a3728] font-semibold">Thực Đơn Dinh Dưỡng Lành Mạnh</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
              <span>Nướng Mới Mỗi Sáng 06:30 • 100% Thuần Tự Nhiên</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#4a3728]">
              Thực Đơn Bánh Dinh Dưỡng &amp; Ăn Kiêng
            </h1>
            <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
              Tuyển tập các mẻ bánh ngũ cốc nguyên cám, granola nướng giòn mật ong và biscotti hạnh nhân. Cam kết 100% không đường tinh luyện, minh bạch chỉ số calo cho mọi nhu cầu vóc dáng.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#78716c]" />
            <Input
              placeholder="Tìm kiếm món bánh..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
              className="pl-10 h-11 bg-[#faf8f5] border-[#eadbce] rounded-full text-xs placeholder:text-[#a8a29e] focus-visible:ring-[#4a3728]"
            />
          </div>
        </div>
      </div>

      {/* ================= Category & Dietary Filter Chips ================= */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory(undefined)
              setPage(0)
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
              selectedCategory === undefined
                ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                : 'bg-white hover:bg-[#f4efea] text-[#78716c] border border-[#eadbce]'
            }`}
          >
            Tất cả bánh ({rawProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setPage(0)
              }}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                  : 'bg-white hover:bg-[#f4efea] text-[#78716c] border border-[#eadbce]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Preference Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#78716c] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#47654c]" />
            Nhu cầu ăn kiêng:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'no_sugar', label: 'Không đường tinh luyện (Sugar-Free)' },
            { id: 'high_protein', label: 'Giàu đạm (High Protein)' },
            { id: 'low_carb', label: 'Ít tinh bột (Low Carb / Keto)' },
          ].map((diet) => (
            <button
              key={diet.id}
              onClick={() => setSelectedDiet(diet.id)}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                selectedDiet === diet.id
                  ? 'bg-[#47654c] text-white font-semibold'
                  : 'bg-white text-[#78716c] border border-[#eadbce] hover:bg-[#f4efea]'
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Product Grid ================= */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#4a3728] animate-spin" />
          <span className="text-xs text-[#78716c] font-medium">Đang chuẩn bị mẻ bánh tươi...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eadbce] p-12 text-center space-y-3">
          <p className="text-sm text-[#78716c]">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setKeyword('')
              setSelectedCategory(undefined)
              setSelectedDiet('all')
            }}
            className="bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full text-xs"
          >
            Xóa bộ lọc &amp; Xem tất cả
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* ================= Pagination ================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border-[#eadbce] rounded-full text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trang trước
          </Button>
          <span className="text-xs text-[#78716c] px-3">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="border-[#eadbce] rounded-full text-xs"
          >
            Trang sau
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
