import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Search,
  Phone,
  ChevronDown,
  Flame,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

const PRODUCT_CATEGORIES = [
  {
    name: 'Tất cả sản phẩm',
    desc: 'Bánh nướng & ngũ cốc dinh dưỡng',
    link: '/products',
    badge: '89 món',
  },
  {
    name: 'Bánh Biscotti nguyên cám',
    desc: 'Giòn rụm 0g đường tinh luyện',
    link: '/products?category=Biscotti',
    badge: 'Best seller',
  },
  {
    name: 'Granola siêu hạt',
    desc: '9 loại hạt nướng mật ong hoa nhãn',
    link: '/products?category=Granola',
    badge: 'Signature',
  },
  {
    name: 'Bánh ngói hạnh nhân keto',
    desc: '100% hạnh nhân lát chuẩn Keto',
    link: '/products?category=B%C3%A1nh+ng%C3%B3i',
    badge: 'Keto friendly',
  },
  {
    name: 'Thanh hạt (Nut Bar)',
    desc: 'Năng lượng bền bỉ cho ngày dài',
    link: '/products?category=Thanh+h%E1%BA%A1t',
    badge: 'High protein',
  },
  {
    name: 'Bún mì nui gạo lứt',
    desc: 'Tinh bột chậm no lâu thuần thực vật',
    link: '/products?category=G%E1%BA%A1o+l%E1%BB%A9t',
    badge: 'Eat clean',
  },
]

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when route changes
  useEffect(() => {
    setProductDropdownOpen(false)
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FEFBF4] shadow-[0_2px_8px_rgba(42,39,37,0.04)]">
      {/* 1. TOPBAR ANNOUNCEMENT - Deep Terracotta */}
      <div className="bg-[#91350a] text-[#f6e9df] text-xs font-semibold py-2 px-4 transition-colors">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-center sm:text-left">
          <div className="w-full text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
            <span className="font-medium tracking-wide">
              Freeship toàn quốc đơn từ 299k • Giao 2h HCM &amp; Hà Nội
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <a
              href="tel:0979764185"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline: 097 97 64 185</span>
            </a>
            <span className="text-[#f6e9df]/40">•</span>
            <span>08:00 - 21:00</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="border-b border-[#E5E2DF]/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo Brand: Official HeBekery Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 focus:outline-none"
            title="HeBekery - Health & Beauty Foods"
          >
            <img
              src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/logo.png?1790765513162"
              alt="HeBekery - Health & Beauty Foods"
              className="h-9 sm:h-11 w-auto object-contain"
              onError={(e) => {
                // Fallback in case remote CDN fails
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback')
                if (fallback) fallback.classList.remove('hidden')
              }}
            />
            <div className="logo-fallback hidden flex-col">
              <span className="font-display text-2xl font-black text-[#006561] tracking-tight">
                HeBekery
              </span>
              <span className="text-[10px] text-[#C9785C] tracking-widest font-semibold uppercase">
                Health &amp; Beauty Foods
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* SẢN PHẨM Mega Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  location.pathname.startsWith('/product')
                    ? 'text-[#006561] font-black'
                    : 'text-[#2A2725] hover:text-[#006561]'
                }`}
              >
                <span>Sản phẩm</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    productDropdownOpen ? 'rotate-180 text-[#006561]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {productDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#E5E2DF] shadow-lg p-2 z-50 space-y-1"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.link}
                        onClick={() => setProductDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FEFBF4] text-[#2A2725] hover:text-[#006561] transition-colors group"
                      >
                        <div>
                          <p className="text-xs font-bold font-display group-hover:text-[#006561]">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-[#6B6661] mt-0.5">{cat.desc}</p>
                        </div>
                        <span className="text-[10px] bg-[#006561]/8 text-[#006561] px-2 py-0.5 rounded-full font-medium">
                          {cat.badge}
                        </span>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-[#E5E2DF]/60">
                      <Link
                        to="/products"
                        onClick={() => setProductDropdownOpen(false)}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-center text-xs font-bold text-[#006561] bg-[#006561]/6 hover:bg-[#006561]/12 transition-colors"
                      >
                        <span>Xem tất cả sản phẩm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/about"
              className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                location.pathname === '/about'
                  ? 'text-[#006561] font-black'
                  : 'text-[#2A2725] hover:text-[#006561]'
              }`}
            >
              Câu chuyện
            </Link>

            <Link
              to="/products?category=Combo"
              className="px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561] flex items-center gap-1.5 transition-colors"
            >
              <span>Combo quà</span>
              <span className="bg-[#B23A2A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                Hot
              </span>
            </Link>

            <Link
              to="/blogs"
              className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors ${location.pathname.startsWith('/blog') ? 'text-[#006561] font-black' : 'text-[#2A2725] hover:text-[#006561]'}`}
            >
              Blog
            </Link>

            <Link
              to="/bmi-tdee"
              className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                location.pathname === '/bmi-tdee'
                  ? 'text-[#006561] font-black'
                  : 'text-[#2A2725] hover:text-[#006561]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#C9785C]" />
              <span>Tính Calo &amp; BMI</span>
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                location.pathname === '/contact'
                  ? 'text-[#006561] font-black'
                  : 'text-[#2A2725] hover:text-[#006561]'
              }`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Toggle / Form */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm bánh, hạt, granola..."
                    autoFocus
                    className="w-48 sm:w-64 pl-8 pr-7 py-1.5 rounded-full text-xs bg-white border border-[#006561] text-[#2A2725] focus:outline-none shadow-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-[#6B6661] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2 text-[#6B6661] hover:text-[#2A2725]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Tìm kiếm sản phẩm"
                  className="w-9 h-9 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:border-[#006561] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hotline Phone Pill (Desktop) */}
            <a
              href="tel:0979764185"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006561]/8 text-[#006561] text-xs font-bold hover:bg-[#006561]/15 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>097 97 64 185</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Xem giỏ hàng"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:border-[#006561] transition-all cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B23A2A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {isAuthenticated ? (
              <div className="relative group">
                <Link
                  to="/profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center font-bold text-xs hover:bg-[#006561] hover:text-white transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-[#E5E2DF] shadow-md p-2 hidden group-hover:block z-50">
                  <p className="text-xs font-bold text-[#2A2725] px-2 py-1 truncate">
                    {user?.name || user?.email}
                  </p>
                  <div className="border-t border-[#E5E2DF]/60 my-1" />
                  <Link
                    to="/profile"
                    className="block px-2 py-1.5 text-xs text-[#2A2725] hover:bg-[#FEFBF4] rounded-lg"
                  >
                    Tài khoản của tôi
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-2 py-1.5 text-xs text-[#2A2725] hover:bg-[#FEFBF4] rounded-lg"
                  >
                    Đơn mua
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-2 py-1.5 text-xs font-bold text-[#006561] hover:bg-[#FEFBF4] rounded-lg"
                    >
                      Quản trị HeBekery
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-2 py-1.5 text-xs text-[#B23A2A] hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#006561] text-[#FEFBF4] text-xs font-bold hover:bg-[#1a9a9b] transition-colors shadow-xs"
              >
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#2A2725] hover:bg-black/5"
              aria-label="Mở menu di động"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-[#E5E2DF] bg-[#FEFBF4] px-4 py-5 space-y-4 overflow-hidden"
          >
            {/* Search input in mobile menu */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bánh, ngũ cốc, granola..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-[#E5E2DF] text-[#2A2725]"
              />
              <Search className="w-4 h-4 text-[#6B6661] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#9A938C] uppercase tracking-wider px-2">
                Danh mục sản phẩm
              </p>
              {PRODUCT_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.link}
                  className="flex items-center justify-between p-2 rounded-lg text-xs font-bold text-[#2A2725] hover:bg-white"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-[#006561] bg-[#006561]/8 px-2 py-0.5 rounded-full">
                    {cat.badge}
                  </span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5E2DF] space-y-1">
              <Link
                to="/about"
                className="block p-2 rounded-lg text-xs font-bold text-[#2A2725] hover:bg-white"
              >
                Câu chuyện HeBekery
              </Link>
              <Link
                to="/bmi-tdee"
                className="flex items-center gap-1.5 p-2 rounded-lg text-xs font-bold text-[#006561] hover:bg-white"
              >
                <Flame className="w-3.5 h-3.5 text-[#C9785C]" />
                <span>Công cụ tính Calo &amp; BMI</span>
              </Link>
              <Link
                to="/contact"
                className="block p-2 rounded-lg text-xs font-bold text-[#2A2725] hover:bg-white"
              >
                Liên hệ tiệm bánh &amp; Bếp
              </Link>
              <Link
                to="/tracking"
                className="block p-2 rounded-lg text-xs font-bold text-[#2A2725] hover:bg-white"
              >
                Tra cứu đơn hàng
              </Link>
              {!isAuthenticated && (
                <div className="pt-2 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 text-center py-2 rounded-xl bg-[#006561] text-white text-xs font-bold"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center py-2 rounded-xl border border-[#2A2725] text-[#2A2725] text-xs font-bold"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
