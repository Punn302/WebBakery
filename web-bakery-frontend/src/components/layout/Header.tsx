import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Shield,
  Search,
  Phone,
  ChevronDown,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'

const PRODUCT_CATEGORIES = [
  {
    name: 'Biscotti nguyên cám',
    desc: 'Giòn rụm 0g đường tinh luyện',
    link: '/products?search=biscotti',
    badge: 'Best seller',
  },
  {
    name: 'Granola siêu hạt',
    desc: 'Yến mạch nướng mật ong hoa nhãn',
    link: '/products?search=granola',
    badge: 'Signature',
  },
  {
    name: 'Bánh ngói keto',
    desc: '100% hạnh nhân lát thơm béo',
    link: '/products?search=keto',
    badge: 'Keto friendly',
  },
  {
    name: 'Thanh hạt (Nut Bar)',
    desc: 'Năng lượng bền bỉ cho tập luyện',
    link: '/products?search=bar',
    badge: 'High protein',
  },
  {
    name: 'Bún mì gạo lứt',
    desc: 'Tinh bột chậm no lâu thuần chay',
    link: '/products?search=g%E1%BA%A1o+l%E1%BB%A9t',
    badge: 'Eat clean',
  },
]

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [mobileProductExpanded, setMobileProductExpanded] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleMouseEnterProducts = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setProductDropdownOpen(true)
  }

  const handleMouseLeaveProducts = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setProductDropdownOpen(false)
    }, 180)
  }

  useEffect(() => {
    setMobileMenuOpen(false)
    setProductDropdownOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-40 w-full font-text select-none">
      {/* 1. ANNOUNCEMENT TOPBAR */}
      <div className="bg-[#91350a] text-[#f6e9df] text-xs py-2 px-4 border-b border-[#91350a]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFE6DC] animate-pulse" />
            <span className="font-medium tracking-wide">
              Freeship toàn quốc đơn từ 299k • Giao 2h HCM
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="text-[#f6e9df]/80 font-normal">Hotline tư vấn:</span>
            <a
              href="tel:0979764185"
              className="font-bold text-[#f6e9df] hover:underline bg-[#f6e9df]/15 hover:bg-[#f6e9df]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3 h-3 text-[#FFE6DC]" />
              <span>097 97 64 185</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="bg-[#FEFBF4]/95 backdrop-blur-md border-b border-[#E5E2DF] transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/images/logo.webp"
              alt="HeBekery"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-tight text-[#006561] leading-none group-hover:text-[#1a9a9b] transition-colors">
                HeBekery
              </span>
              <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#6B6661] mt-1 leading-none">
                Health &amp; Beauty Foods
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-[13.5px] font-semibold text-[#2A2725]">
            {/* SẢN PHẨM with dropdown */}
            <div
              className="relative py-6"
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
            >
              <Link
                to="/products"
                className={`flex items-center gap-1 transition-colors hover:text-[#006561] ${
                  location.pathname.startsWith('/products') ? 'text-[#006561] font-bold' : ''
                }`}
              >
                <span>SẢN PHẨM</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    productDropdownOpen ? 'rotate-180 text-[#006561]' : 'text-[#6B6661]'
                  }`}
                />
              </Link>

              {/* Mega Dropdown */}
              <AnimatePresence>
                {productDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 w-80 bg-[#FEFBF4] border border-[#E5E2DF] rounded-2xl shadow-xl p-3 z-50 overflow-hidden"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#9A938C] px-3 py-1.5">
                      Danh Mục Lành Mạnh
                    </div>
                    <div className="space-y-1">
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.name}
                          to={cat.link}
                          className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#F4EFE6] transition-colors group"
                        >
                          <div>
                            <div className="text-sm font-semibold text-[#2A2725] group-hover:text-[#006561] transition-colors">
                              {cat.name}
                            </div>
                            <div className="text-xs text-[#6B6661] font-normal">{cat.desc}</div>
                          </div>
                          <span className="text-[10px] font-medium text-[#7B9461] bg-[#7B9461]/10 px-2 py-0.5 rounded-full mt-0.5">
                            {cat.badge}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E5E2DF] px-2">
                      <Link
                        to="/products"
                        className="flex items-center justify-between text-xs font-bold text-[#006561] hover:text-[#1a9a9b] p-1.5 transition-colors"
                      >
                        <span>Xem tất cả thực đơn healthy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/about"
              className={`hover:text-[#006561] transition-colors ${
                location.pathname === '/about' ? 'text-[#006561] font-bold' : ''
              }`}
            >
              CÂU CHUYỆN
            </Link>

            <Link
              to="/products?search=combo"
              className="hover:text-[#006561] transition-colors flex items-center gap-1"
            >
              <span>COMBO QUÀ</span>
              <span className="text-[9px] font-bold uppercase text-white bg-[#C9785C] px-1.5 py-0.2 rounded-full">
                Hot
              </span>
            </Link>

            <Link
              to="/about"
              className="hover:text-[#006561] transition-colors"
            >
              BLOG
            </Link>

            <Link
              to="/bmi-tdee"
              className={`hover:text-[#006561] transition-colors flex items-center gap-1 ${
                location.pathname === '/bmi-tdee' ? 'text-[#006561] font-bold' : ''
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#C9785C]" />
              <span>TÍNH BMI &amp; TDEE</span>
            </Link>

            <Link
              to="/contact"
              className={`hover:text-[#006561] transition-colors ${
                location.pathname === '/contact' ? 'text-[#006561] font-bold' : ''
              }`}
            >
              LIÊN HỆ
            </Link>
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Search Input / Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white border border-[#006561] rounded-full px-3 py-1 shadow-sm"
                >
                  <Search className="w-4 h-4 text-[#006561] mr-2 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm bánh, calo..."
                    className="w-32 sm:w-48 text-xs bg-transparent focus:outline-none text-[#2A2725]"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-[#9A938C] hover:text-[#2A2725] ml-1 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#2A2725] hover:text-[#006561] hover:bg-[#F4EFE6] rounded-full transition-colors cursor-pointer"
                  title="Tìm kiếm"
                  aria-label="Tìm kiếm sản phẩm"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Hotline Badge (Desktop) */}
            <a
              href="tel:0979764185"
              className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-[#006561] hover:text-[#1a9a9b] bg-[#FEFBF4] border border-[#006561]/25 hover:border-[#006561] px-3 py-1.5 rounded-full transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9785C]" />
              <span>0979 764 185</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#2A2725] hover:text-[#006561] hover:bg-[#F4EFE6] rounded-full transition-colors cursor-pointer"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#B23A2A] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center leading-none shadow-sm"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Auth / Account */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/dashboard')}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold border-[#E5E2DF] text-[#006561] hover:bg-[#006561]/10 rounded-full"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Quản trị</span>
                  </Button>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E5E2DF] bg-white text-[#2A2725] hover:bg-[#F4EFE6] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#006561]" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-[#9A938C] hover:text-[#B23A2A] font-medium transition-colors ml-1 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] font-semibold text-xs px-4 py-2 rounded-full shadow-sm cursor-pointer transition-colors"
              >
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2A2725] hover:bg-[#F4EFE6] rounded-full transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE RESPONSIVE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-[#E5E2DF] bg-[#FEFBF4] px-4 pt-3 pb-6 space-y-4 shadow-lg overflow-hidden"
          >
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bánh nguyên cám, granola, calo..."
                className="w-full text-xs bg-white border border-[#E5E2DF] rounded-full py-2 pl-9 pr-4 text-[#2A2725] focus:outline-none focus:border-[#006561]"
              />
              <Search className="w-4 h-4 text-[#6B6661] absolute left-3 top-2.5" />
            </form>

            <nav className="flex flex-col space-y-1 text-sm font-semibold text-[#2A2725]">
              {/* Expandable Products menu */}
              <div>
                <button
                  onClick={() => setMobileProductExpanded(!mobileProductExpanded)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors text-left"
                >
                  <span>SẢN PHẨM</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileProductExpanded ? 'rotate-180 text-[#006561]' : ''
                    }`}
                  />
                </button>
                {mobileProductExpanded && (
                  <div className="pl-4 pr-2 py-1 space-y-1 bg-[#F8F6F5] rounded-xl my-1">
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.link}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 px-3 text-xs font-medium text-[#2A2725] hover:text-[#006561]"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-[#7B9461]">{cat.badge}</span>
                      </Link>
                    ))}
                    <Link
                      to="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 text-xs font-bold text-[#006561]"
                    >
                      Xem tất cả sản phẩm →
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors"
              >
                CÂU CHUYỆN
              </Link>
              <Link
                to="/products?search=combo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors flex items-center justify-between"
              >
                <span>COMBO QUÀ</span>
                <span className="text-[9px] font-bold uppercase text-white bg-[#C9785C] px-1.5 py-0.5 rounded-full">
                  Ưu đãi
                </span>
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors"
              >
                BLOG
              </Link>
              <Link
                to="/bmi-tdee"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors text-[#006561] flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 text-[#C9785C]" />
                <span>TÍNH BMI &amp; TDEE</span>
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-[#F4EFE6] transition-colors"
              >
                LIÊN HỆ
              </Link>
            </nav>

            {/* Mobile Contact & Hotline */}
            <div className="pt-3 border-t border-[#E5E2DF] flex items-center justify-between text-xs text-[#6B6661]">
              <span>Hotline tư vấn dinh dưỡng:</span>
              <a
                href="tel:0979764185"
                className="font-bold text-[#006561] flex items-center gap-1 bg-[#F4EFE6] px-2.5 py-1 rounded-full"
              >
                <Phone className="w-3 h-3 text-[#C9785C]" />
                <span>0979 764 185</span>
              </a>
            </div>

            {isAuthenticated && isAdmin && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/admin/dashboard')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold border-[#E5E2DF] text-[#006561] rounded-full"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Trang quản trị (Admin)</span>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
