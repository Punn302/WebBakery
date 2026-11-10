import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Plus,
  X,
  Check,
  ShoppingBag,
  Sparkles,
  Flame,
  Award,
  Truck,
  RotateCcw,
  Heart,
  Gift,
  ArrowRight,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface FlavorItem {
  id: string
  name: string
  category: string
  calories: number
  protein: number
  fiber: number
  imageUrl: string
  badge?: string
}

const AVAILABLE_FLAVORS: FlavorItem[] = [
  {
    id: 'flv-biscotti-fruity',
    name: 'Biscotti Trái Cây & Hạt',
    category: 'Biscotti',
    calories: 110,
    protein: 6,
    fiber: 4,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/chatgpt-image-aug-8-2026-03-54-29-pm.png?v=1786179391230',
    badge: 'Signature',
  },
  {
    id: 'flv-biscotti-choco',
    name: 'Biscotti Chocolate Đen 70%',
    category: 'Biscotti',
    calories: 120,
    protein: 5,
    fiber: 4,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/anh-1-min.png?v=1754442252570',
    badge: 'Best-Seller',
  },
  {
    id: 'flv-biscotti-matcha',
    name: 'Biscotti Trà Xanh Uji Nhật',
    category: 'Biscotti',
    calories: 115,
    protein: 6,
    fiber: 3,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/biscotti-matcha.png?v=1786179391230',
    badge: 'Eat Clean',
  },
  {
    id: 'flv-biscotti-cheese',
    name: 'Biscotti Phô Mai Mặn Parmesan',
    category: 'Biscotti',
    calories: 128,
    protein: 7,
    fiber: 2,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/biscotti-salty-cheese.png?v=1786179391230',
    badge: 'Mới nướng',
  },
  {
    id: 'flv-granola-honey',
    name: 'Granola Mật Ong Hoa Nhãn',
    category: 'Granola',
    calories: 140,
    protein: 7,
    fiber: 5,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/granola-truyen-thong.png?v=1786179391230',
    badge: 'Top 1 Sáng',
  },
  {
    id: 'flv-granola-choco',
    name: 'Granola Siêu Hạt Cacao Nướng',
    category: 'Granola',
    calories: 145,
    protein: 6,
    fiber: 5,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/granola-chocolate.png?v=1786179391230',
  },
  {
    id: 'flv-almond-tuiles',
    name: 'Bánh Ngói Hạnh Nhân Keto',
    category: 'Bánh Ngói',
    calories: 95,
    protein: 8,
    fiber: 1,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/banh-ngoi-hanh-nhan.png?v=1786179391230',
    badge: 'Keto Low-Carb',
  },
  {
    id: 'flv-energy-bar',
    name: 'Thanh Hạt Mắc Ca & Yến Mạch',
    category: 'Thanh Hạt',
    calories: 130,
    protein: 6,
    fiber: 4,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/thanh-hat-nang-luong.png?v=1786179391230',
    badge: 'Gym & Fitness',
  },
]

type BoxSize = 4 | 6

export const BoxBuilderPage: React.FC = () => {
  const navigate = useNavigate()
  const { addItem, setIsCartOpen } = useCart()
  const [boxSize, setBoxSize] = useState<BoxSize>(4)
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorItem[]>([
    AVAILABLE_FLAVORS[0],
    AVAILABLE_FLAVORS[1],
  ])

  const maxSlots = boxSize
  const price = boxSize === 4 ? 380000 : 540000
  const originalPrice = boxSize === 4 ? 450000 : 675000
  const isComplete = selectedFlavors.length === maxSlots

  const handleAddFlavor = (flavor: FlavorItem) => {
    if (selectedFlavors.length >= maxSlots) {
      toast.warning(`Hộp ${boxSize} món đã đầy! Hãy gỡ bớt vị nếu muốn đổi vị khác.`)
      return
    }
    setSelectedFlavors((prev) => [...prev, flavor])
  }

  const handleRemoveSlot = (index: number) => {
    setSelectedFlavors((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSizeChange = (size: BoxSize) => {
    setBoxSize(size)
    if (selectedFlavors.length > size) {
      setSelectedFlavors((prev) => prev.slice(0, size))
    }
  }

  // Nutrition calculations
  const totalCalories = selectedFlavors.reduce((acc, f) => acc + f.calories, 0)
  const avgCalories = selectedFlavors.length > 0 ? Math.round(totalCalories / selectedFlavors.length) : 0
  const totalProtein = selectedFlavors.reduce((acc, f) => acc + f.protein, 0)
  const totalFiber = selectedFlavors.reduce((acc, f) => acc + f.fiber, 0)

  const handleAddBoxToCart = async () => {
    if (!isComplete) {
      toast.warning(`Vui lòng chọn đủ ${maxSlots} vị bánh cho hộp nhé! (Còn thiếu ${maxSlots - selectedFlavors.length} vị)`)
      return
    }

    const flavorNames = selectedFlavors.map((f) => f.name).join(', ')
    const bundleProduct = {
      id: `COMBO-BOX-${boxSize}-${Date.now().toString().slice(-4)}`,
      name: `Hộp Bánh Mix Vị HeBekery (${boxSize} Món Tự Chọn)`,
      price,
      imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/chatgpt-image-aug-8-2026-03-54-29-pm.png?v=1786179391230',
      stock: 99,
      calories: avgCalories,
      weight: boxSize === 4 ? 'Hộp 4 Vị (~1kg)' : 'Hộp 6 Vị (~1.5kg)',
      category: 'Combo',
      description: `Gồm các vị nướng mộc: ${flavorNames}`,
    }

    await addItem(bundleProduct as any, 1)
    toast.success('Đã thêm Hộp Bánh Mix Vị vào giỏ hàng!')
    setIsCartOpen(true)
  }

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-80px)] py-10 sm:py-14 font-text">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trải Nghiệm Tự Do Sáng Tạo</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2A2725]">
            Tự Phối Hộp Bánh Mix Vị HeBekery
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] max-w-xl mx-auto">
            Thỏa sức kết hợp các vị bánh Biscotti, ngũ cốc Granola và bánh ngói keto yêu thích vào trong một chiếc hộp quà tặng sang trọng với giá ưu đãi combo tiết kiệm đến 20%.
          </p>
        </div>

        {/* Step 1: Select Box Size */}
        <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#006561] text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>Chọn Kích Thước Hộp Bánh</span>
            </h2>
            <Badge variant="outline" className="text-[#006561] border-[#006561]/30 bg-[#006561]/5 text-xs font-bold">
              Freeship toàn quốc
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div
              onClick={() => handleSizeChange(4)}
              className={cn(
                'p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between',
                boxSize === 4
                  ? 'border-[#006561] bg-[#006561]/5 shadow-xs'
                  : 'border-[#E5E2DF] hover:border-[#006561]/40 bg-white'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#006561]" />
                  <span className="font-bold text-sm text-[#2A2725]">Hộp Tiêu Chuẩn 4 Vị</span>
                  <span className="bg-[#FFE6DC] text-[#B23A2A] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    Tiết kiệm 15%
                  </span>
                </div>
                <p className="text-xs text-[#6B6661]">
                  Thích hợp dùng cho cá nhân hoặc cặp đôi ăn kiêng trong 2 - 3 tuần.
                </p>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="font-display text-lg font-bold text-[#006561]">
                    {formatCurrency(380000)}
                  </span>
                  <span className="text-xs text-[#9A938C] line-through">
                    {formatCurrency(450000)}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4',
                  boxSize === 4 ? 'border-[#006561] bg-[#006561]' : 'border-[#E5E2DF]'
                )}
              >
                {boxSize === 4 && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            <div
              onClick={() => handleSizeChange(6)}
              className={cn(
                'p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between',
                boxSize === 6
                  ? 'border-[#006561] bg-[#006561]/5 shadow-xs'
                  : 'border-[#E5E2DF] hover:border-[#006561]/40 bg-white'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#C9785C]" />
                  <span className="font-bold text-sm text-[#2A2725]">Hộp Quà Cao Cấp 6 Vị</span>
                  <span className="bg-[#FFE6DC] text-[#B23A2A] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    Tiết kiệm 20%
                  </span>
                </div>
                <p className="text-xs text-[#6B6661]">
                  Dành cho gia đình hoặc làm quà biếu sức khỏe, tặng kèm túi canvas Hebekery.
                </p>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="font-display text-lg font-bold text-[#006561]">
                    {formatCurrency(540000)}
                  </span>
                  <span className="text-xs text-[#9A938C] line-through">
                    {formatCurrency(675000)}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4',
                  boxSize === 6 ? 'border-[#006561] bg-[#006561]' : 'border-[#E5E2DF]'
                )}
              >
                {boxSize === 6 && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 & 3: Interactive Slots & Flavor Picker Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Box Preview (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E2DF] p-6 space-y-6 sticky top-24 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-3">
              <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#006561] text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Khay Hộp Bánh Của Bạn</span>
              </h2>
              <span className="text-xs font-semibold text-[#006561]">
                {selectedFlavors.length}/{maxSlots} ngăn
              </span>
            </div>

            {/* Visual Box Container */}
            <div
              className={cn(
                'grid gap-3 p-4 bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#E5E2DF]',
                boxSize === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
              )}
            >
              {[...Array(maxSlots)].map((_, index) => {
                const flavor = selectedFlavors[index]
                return (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl bg-white border border-[#E5E2DF] p-3 flex flex-col items-center justify-center text-center overflow-hidden transition-all shadow-xs"
                  >
                    {flavor ? (
                      <>
                        <img
                          src={optimizeCloudinaryUrl(flavor.imageUrl, 150)}
                          alt={flavor.name}
                          className="w-14 h-14 object-contain mb-1.5"
                        />
                        <span className="text-[11px] font-bold text-[#2A2725] line-clamp-1">
                          {flavor.name}
                        </span>
                        <span className="text-[10px] text-[#006561] font-mono font-medium">
                          {flavor.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 border border-[#E5E2DF] text-[#6B6661] hover:text-[#B23A2A] hover:bg-[#B23A2A]/10 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          title="Gỡ vị này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-1 text-[#9A938C]">
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E5E2DF] flex items-center justify-center mx-auto text-[#6B6661]">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium block">Ngăn #{index + 1} trống</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Nutrition Breakdown */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E2DF] space-y-2.5">
              <span className="text-[11px] font-bold text-[#2A2725] uppercase tracking-wider block">
                Chỉ Số Dinh Dưỡng Ước Tính Cả Hộp:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Calo TB / Khẩu phần</span>
                  <span className="font-bold text-xs text-[#006561]">{avgCalories} kcal</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Tổng Protein</span>
                  <span className="font-bold text-xs text-[#2A2725]">{totalProtein}g</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Tổng Chất xơ</span>
                  <span className="font-bold text-xs text-[#C9785C]">{totalFiber}g</span>
                </div>
              </div>
            </div>

            {/* Pricing & Add to Cart Action */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#6B6661] block">Giá combo ưu đãi:</span>
                  <span className="font-display text-2xl font-bold text-[#006561]">
                    {formatCurrency(price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#9A938C] line-through block">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-[#16a34a]">
                    Tiết kiệm {formatCurrency(originalPrice - price)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAddBoxToCart}
                disabled={!isComplete}
                className={cn(
                  'w-full py-4 h-12 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-all',
                  isComplete
                    ? 'bg-[#006561] hover:bg-[#004e4a] text-white'
                    : 'bg-[#E5E2DF] text-[#9A938C] cursor-not-allowed'
                )}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>
                  {isComplete
                    ? 'Thêm Hộp Bánh Vào Giỏ Hàng'
                    : `Chọn thêm ${maxSlots - selectedFlavors.length} vị để hoàn tất`}
                </span>
              </Button>
            </div>
          </div>

          {/* Right: Flavor Catalog Selector (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E5E2DF] pb-3">
              <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#006561] text-white text-xs flex items-center justify-center font-mono">3</span>
                <span>Chọn Hương Vị Chữ Ký HeBekery</span>
              </h2>
              <p className="text-xs text-[#6B6661] mt-1">
                Bấm vào món bánh bất kỳ để thêm vào khay hộp của bạn (có thể chọn trùng vị nếu thích)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_FLAVORS.map((flavor) => {
                const count = selectedFlavors.filter((f) => f.id === flavor.id).length
                return (
                  <div
                    key={flavor.id}
                    onClick={() => handleAddFlavor(flavor)}
                    className="p-4 rounded-2xl border border-[#E5E2DF] hover:border-[#006561] bg-[#FAF7F2]/40 hover:bg-[#006561]/5 transition-all cursor-pointer flex items-center gap-3 relative group"
                  >
                    <img
                      src={optimizeCloudinaryUrl(flavor.imageUrl, 120)}
                      alt={flavor.name}
                      className="w-16 h-16 object-contain rounded-xl bg-white border border-[#E5E2DF] p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      {flavor.badge && (
                        <span className="text-[10px] font-bold text-[#B23A2A] bg-[#FFE6DC] px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                          {flavor.badge}
                        </span>
                      )}
                      <h3 className="font-semibold text-xs text-[#2A2725] truncate">
                        {flavor.name}
                      </h3>
                      <p className="text-[11px] text-[#6B6661]">
                        {flavor.calories} kcal • {flavor.protein}g đạm • {flavor.fiber}g xơ
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {count > 0 ? (
                        <span className="w-7 h-7 rounded-full bg-[#006561] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          x{count}
                        </span>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white border border-[#E5E2DF] group-hover:border-[#006561] text-[#6B6661] group-hover:text-[#006561] flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
