import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { productApi, categoryApi } from '@/api'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductDetailModal } from './ProductDetailModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export const ProductCatalogPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
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

  const products = productData?.content || []
  const totalPages = productData?.totalPages || 0

  return (
    <div className="space-y-8">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e7e5e4] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
            Thực Đơn Bánh Dinh Dưỡng
          </h1>
          <p className="text-xs text-[#78716c] mt-1">
            Tuyển chọn các món bánh ngũ cốc nguyên cám, bánh hạt dinh dưỡng ít calo tốt cho sức khỏe
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#a8a29e]" />
          <Input
            placeholder="Tìm kiếm món bánh..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Button
          size="sm"
          variant={selectedCategory === undefined ? 'default' : 'secondary'}
          onClick={() => {
            setSelectedCategory(undefined)
            setPage(0)
          }}
          className="text-xs shrink-0"
        >
          Tất cả sản phẩm
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.id ? 'default' : 'secondary'}
            onClick={() => {
              setSelectedCategory(cat.id)
              setPage(0)
            }}
            className="text-xs shrink-0"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#47654c] animate-spin" />
          <p className="text-xs text-[#78716c]">Đang nạp thực đơn bánh tươi...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center border border-[#e7e5e4] bg-white p-8 space-y-3">
          <p className="font-semibold text-sm text-[#1c1917]">Không tìm thấy sản phẩm phù hợp</p>
          <p className="text-xs text-[#78716c]">
            Vui lòng thử tìm kiếm bằng từ khóa khác hoặc bỏ chọn bộ lọc danh mục.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setKeyword('')
              setSelectedCategory(undefined)
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6 border-t border-[#e7e5e4]">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trang trước
          </Button>
          <span className="text-xs text-[#78716c] px-3">
            Trang <strong>{page + 1}</strong> / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
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
