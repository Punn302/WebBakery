import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Loader2,
  Filter,
  ChevronDown,
  X,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { productApi } from '@/api'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductDetailModal } from './ProductDetailModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 6 Core HeBekery Categories for Sidebar
const HEBEKERY_CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'biscotti', name: 'Bánh Biscotti' },
  { id: 'granola', name: 'Granola siêu hạt' },
  { id: 'keto', name: 'Bánh ngói keto' },
  { id: 'bar', name: 'Thanh năng lượng' },
  { id: 'gao_lut', name: 'Mì nui gạo lứt' },
]

// Health Needs ("BẠN CẦN")
const HEALTH_NEEDS = [
  { id: 'all', label: 'Tất cả nhu cầu' },
  { id: 'weight_loss', label: 'Ăn kiêng giảm cân' },
  { id: 'keto', label: 'Keto / Low carb' },
  { id: 'high_protein', label: 'Tập luyện (High Protein)' },
  { id: 'low_sugar', label: 'Đường huyết thấp (Eat clean)' },
  { id: 'vegan', label: 'Thuần chay' },
]

// Price Ranges
const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'under_100k', label: 'Dưới 100k', min: 0, max: 100000 },
  { id: '100k_250k', label: '100k - 250k', min: 100000, max: 250000 },
  { id: '250k_500k', label: '250k - 500k', min: 250000, max: 500000 },
  { id: 'over_500k', label: 'Trên 500k', min: 500000, max: Infinity },
]

// Sort options
const SORT_OPTIONS = [
  { id: 'bestseller', label: 'Bán chạy nhất' },
  { id: 'price_asc', label: 'Giá tăng dần' },
  { id: 'price_desc', label: 'Giá giảm dần' },
  { id: 'newest', label: 'Mới nhất' },
]

export const ProductCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || searchParams.get('keyword') || ''

  const [keyword, setKeyword] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedNeed, setSelectedNeed] = useState<string>('all')
  const [selectedPrice, setSelectedPrice] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('bestseller')
  const [page, setPage] = useState(0)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Sync category and search query from URL query params
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      const lower = cat.toLowerCase()
      if (lower.includes('biscotti')) setSelectedCategory('biscotti')
      else if (lower.includes('granola')) setSelectedCategory('granola')
      else if (lower.includes('ngói') || lower.includes('keto')) setSelectedCategory('keto')
      else if (lower.includes('thanh') || lower.includes('bar')) setSelectedCategory('bar')
      else if (lower.includes('gạo lứt') || lower.includes('mì') || lower.includes('bún') || lower.includes('gao_lut')) setSelectedCategory('gao_lut')
      else setSelectedCategory('all')
    }
    const q = searchParams.get('search') || searchParams.get('keyword')
    if (q !== null && q !== undefined) {
      setKeyword(q)
    }
  }, [searchParams])

  // Fetch products from Spring Boot backend (/api/products)
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-catalog', page],
    queryFn: () =>
      productApi.getProducts({
        page,
        size: 24,
        activeOnly: true,
      }),
    staleTime: 2 * 60 * 1000,
  })

  const rawProducts = productData?.content || []
  const totalPages = productData?.totalPages || 1

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts]

    // 1. Keyword search
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      )
    }

    // 2. Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'biscotti') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('biscotti') ||
            p.category?.name.toLowerCase().includes('biscotti')
        )
      } else if (selectedCategory === 'granola') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('granola') ||
            p.category?.name.toLowerCase().includes('granola')
        )
      } else if (selectedCategory === 'keto') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('ngói') ||
            p.name.toLowerCase().includes('keto') ||
            p.name.toLowerCase().includes('hạnh nhân')
        )
      } else if (selectedCategory === 'bar') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('bar') ||
            p.name.toLowerCase().includes('thanh') ||
            p.name.toLowerCase().includes('năng lượng')
        )
      } else if (selectedCategory === 'gao_lut') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('mì') ||
            p.name.toLowerCase().includes('nui') ||
            p.name.toLowerCase().includes('bún') ||
            p.name.toLowerCase().includes('gạo lứt')
        )
      }
    }

    // 3. Health needs filter
    if (selectedNeed !== 'all') {
      if (selectedNeed === 'weight_loss') {
        result = result.filter(
          (p) => (p.calories && p.calories <= 200) || p.name.toLowerCase().includes('nguyên cám')
        )
      } else if (selectedNeed === 'keto') {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes('keto') ||
            (p.carbs && p.carbs <= 15) ||
            p.name.toLowerCase().includes('ngói')
        )
      } else if (selectedNeed === 'high_protein') {
        result = result.filter(
          (p) =>
            (p.protein && p.protein >= 8) ||
            p.name.toLowerCase().includes('hạt') ||
            p.name.toLowerCase().includes('bar')
        )
      } else if (selectedNeed === 'low_sugar') {
        result = result.filter(
          (p) =>
            p.description?.toLowerCase().includes('không đường') ||
            p.name.toLowerCase().includes('mật ong') ||
            p.name.toLowerCase().includes('nguyên cám')
        )
      } else if (selectedNeed === 'vegan') {
        result = result.filter(
          (p) =>
            p.description?.toLowerCase().includes('thực vật') ||
            p.name.toLowerCase().includes('granola') ||
            p.name.toLowerCase().includes('hạt')
        )
      }
    }

    // 4. Price range filter
    if (selectedPrice !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPrice)
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price <= range.max)
      }
    }

    // 5. Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id))
    }

    return result
  }, [rawProducts, keyword, selectedCategory, selectedNeed, selectedPrice, sortBy])

  const clearAllFilters = () => {
    setKeyword('')
    setSelectedCategory('all')
    setSelectedNeed('all')
    setSelectedPrice('all')
    setSortBy('bestseller')
    setSearchParams({})
  }

  const hasActiveFilters =
    keyword !== '' ||
    selectedCategory !== 'all' ||
    selectedNeed !== 'all' ||
    selectedPrice !== 'all'

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-16">
      {/* ================= Minimal Top Header Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 tactile-card space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#6B6661]">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-[#006561] font-semibold">Thực đơn Healthy</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
              THỰC ĐƠN BÁNH DINH DƯỠNG
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-[#6B6661]">
              <span className="bg-[#006561]/8 text-[#006561] px-2.5 py-0.5 rounded-full font-semibold">
                100% Nguyên cám
              </span>
              <span>•</span>
              <span className="bg-[#C9785C]/15 text-[#B23A2A] px-2.5 py-0.5 rounded-full font-semibold">
                0g Đường tinh luyện
              </span>
              <span>•</span>
              <span className="bg-[#2A2725]/6 text-[#2A2725] px-2.5 py-0.5 rounded-full font-semibold">
                Chuẩn Calo &amp; Macro
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#9A938C]" />
            <Input
              type="text"
              placeholder="Tìm theo tên bánh, nguyên liệu..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
              className="pl-10 pr-9 h-10 bg-[#F8F6F5] border-[#E5E2DF] rounded-full text-xs text-[#2A2725] placeholder:text-[#9A938C] focus-visible:ring-[#006561]"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-2.5 text-[#9A938C] hover:text-[#2A2725] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= Main Content Layout (Sidebar + 4-Col Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= Desktop Left Sidebar Filter ================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-[#E5E2DF] tactile-card sticky top-24">
          <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#2A2725] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#006561]" />
              <span>BỘ LỌC TÌM KIẾM</span>
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] text-[#B23A2A] hover:underline font-semibold cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6661] block">
              DANH MỤC SẢN PHẨM
            </span>
            <div className="space-y-1">
              {HEBEKERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setPage(0)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#006561] text-[#FEFBF4] shadow-xs'
                      : 'text-[#2A2725] hover:bg-[#F8F6F5]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Health Needs ("BẠN CẦN") */}
          <div className="space-y-2.5 border-t border-[#E5E2DF] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6661] block">
              BẠN CẦN (NHU CẦU HEALTHY)
            </span>
            <div className="space-y-1">
              {HEALTH_NEEDS.map((need) => (
                <button
                  key={need.id}
                  type="button"
                  onClick={() => {
                    setSelectedNeed(need.id)
                    setPage(0)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedNeed === need.id
                      ? 'bg-[#006561] text-[#FEFBF4] shadow-xs'
                      : 'text-[#2A2725] hover:bg-[#F8F6F5]'
                  }`}
                >
                  <span>{need.label}</span>
                  {selectedNeed === need.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Range */}
          <div className="space-y-2.5 border-t border-[#E5E2DF] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6661] block">
              KHOẢNG GIÁ
            </span>
            <div className="space-y-1">
              {PRICE_RANGES.map((price) => (
                <button
                  key={price.id}
                  type="button"
                  onClick={() => {
                    setSelectedPrice(price.id)
                    setPage(0)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedPrice === price.id
                      ? 'bg-[#006561] text-[#FEFBF4] shadow-xs'
                      : 'text-[#2A2725] hover:bg-[#F8F6F5]'
                  }`}
                >
                  <span>{price.label}</span>
                  {selectedPrice === price.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ================= Product Area (lg:col-span-9) ================= */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Bar: Mobile Filter Button, Result Count, Sort Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF] flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Mobile filter button & Count */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E5E2DF] bg-[#F8F6F5] text-xs font-semibold text-[#2A2725] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#006561]" />
                <span>Bộ lọc</span>
              </button>

              <span className="text-xs font-semibold text-[#2A2725]">
                Tìm thấy <span className="font-mono text-[#006561]">{filteredProducts.length}</span> món bánh
              </span>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B6661] hidden sm:inline">Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#F8F6F5] border border-[#E5E2DF] rounded-full px-4 py-1.5 pr-8 text-xs font-semibold text-[#2A2725] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#006561]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6661] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer / Collapsible Box */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-2.5">
                <span className="font-display text-xs font-bold uppercase text-[#2A2725]">
                  BỘ LỌC HEALTHY
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs text-[#6B6661] hover:text-[#2A2725]"
                >
                  Đóng ✕
                </button>
              </div>

              {/* Mobile Category */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#6B6661] block">Danh mục</span>
                <div className="flex flex-wrap gap-1.5">
                  {HEBEKERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        selectedCategory === cat.id
                          ? 'bg-[#006561] text-white'
                          : 'bg-[#F8F6F5] text-[#2A2725] border border-[#E5E2DF]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Needs */}
              <div className="space-y-1.5 border-t border-[#E5E2DF] pt-3">
                <span className="text-[10px] font-bold uppercase text-[#6B6661] block">Nhu cầu dinh dưỡng</span>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_NEEDS.map((need) => (
                    <button
                      key={need.id}
                      type="button"
                      onClick={() => setSelectedNeed(need.id)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        selectedNeed === need.id
                          ? 'bg-[#006561] text-white'
                          : 'bg-[#F8F6F5] text-[#2A2725] border border-[#E5E2DF]'
                      }`}
                    >
                      {need.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div className="space-y-1.5 border-t border-[#E5E2DF] pt-3">
                <span className="text-[10px] font-bold uppercase text-[#6B6661] block">Mức giá</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_RANGES.map((price) => (
                    <button
                      key={price.id}
                      type="button"
                      onClick={() => setSelectedPrice(price.id)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        selectedPrice === price.id
                          ? 'bg-[#006561] text-white'
                          : 'bg-[#F8F6F5] text-[#2A2725] border border-[#E5E2DF]'
                      }`}
                    >
                      {price.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4-Column Product Grid ================= */}
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-[#E5E2DF]">
              <Loader2 className="w-8 h-8 text-[#006561] animate-spin" />
              <span className="text-xs text-[#6B6661] font-medium">Đang tải danh mục bánh tươi...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E2DF] p-12 text-center space-y-3">
              <p className="font-display text-base font-bold text-[#2A2725]">
                Không tìm thấy món bánh phù hợp
              </p>
              <p className="text-xs text-[#6B6661]">
                Hãy thử chọn lại danh mục hoặc xóa bộ lọc để xem toàn bộ thực đơn.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] text-xs font-semibold px-6 py-2.5 rounded-full cursor-pointer transition-all"
                >
                  Xóa bộ lọc &amp; Xem tất cả
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-[#E5E2DF] rounded-full text-xs text-[#2A2725] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </Button>
              <span className="text-xs text-[#6B6661] px-3 font-mono">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="border-[#E5E2DF] rounded-full text-xs text-[#2A2725] cursor-pointer"
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
