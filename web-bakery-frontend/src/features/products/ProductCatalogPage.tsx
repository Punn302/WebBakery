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

  // Fetch categories from Spring Boot API
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000,
  })

  // Fetch paginated products from Spring Boot API
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
    <div className="space-y-8 pb-12">
      {/* ================= Header Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#eadbce] p-6 sm:p-8 tactile-card space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#78716c]">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-[#4a3728] font-semibold">Thực đơn</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728]">
              Thực Đơn Bánh Dinh Dưỡng
            </h1>
            <p className="text-xs text-[#78716c] font-medium flex items-center gap-2 flex-wrap">
              <span className="bg-[#47654c]/10 text-[#47654c] px-2.5 py-0.5 rounded-full font-semibold">
                100% Nguyên cám
              </span>
              <span>•</span>
              <span className="bg-[#d97724]/10 text-[#d97724] px-2.5 py-0.5 rounded-full font-semibold">
                0g Đường tinh luyện
              </span>
              <span>•</span>
              <span className="bg-[#4a3728]/10 text-[#4a3728] px-2.5 py-0.5 rounded-full font-semibold">
                Minh bạch Macro
              </span>
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#78716c]" />
            <Input
              placeholder="Tìm kiếm món bánh..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
              className="pl-10 h-10 bg-[#faf8f5] border-[#eadbce] rounded-full text-xs placeholder:text-[#a8a29e] focus-visible:ring-[#4a3728]"
            />
          </div>
        </div>
      </div>

      {/* ================= Category & Dietary Filter Chips ================= */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory(undefined)
              setPage(0)
            }}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
              selectedCategory === undefined
                ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                : 'bg-white hover:bg-[#faf8f5] text-[#78716c] border border-[#eadbce]'
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
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                : 'bg-white hover:bg-[#faf8f5] text-[#78716c] border border-[#eadbce]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Preference Filter Bar */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[#78716c] font-medium flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3 h-3 text-[#47654c]" />
            Ăn kiêng:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'no_sugar', label: 'Không đường tinh luyện' },
            { id: 'high_protein', label: 'Giàu đạm (Protein)' },
            { id: 'low_carb', label: 'Ít tinh bột (Low-Carb)' },
          ].map((diet) => (
            <button
              key={diet.id}
              onClick={() => setSelectedDiet(diet.id)}
              className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                selectedDiet === diet.id
                  ? 'bg-[#47654c] text-white font-semibold'
                  : 'bg-white text-[#78716c] border border-[#eadbce] hover:bg-[#faf8f5]'
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
          <span className="text-xs text-[#78716c] font-medium">Đang nạp thực đơn bánh...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eadbce] p-10 text-center space-y-3">
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
            className="bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full text-xs btn-tactile"
          >
            Xóa bộ lọc &amp; Xem tất cả
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border-[#eadbce] rounded-full text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trước
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
            Sau
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
