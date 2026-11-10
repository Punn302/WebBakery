import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  LogOut,
  Settings,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

const PRODUCT_CATEGORIES = [
  { name: '· SẢN PHẨM MỚI', link: '/products?tag=new' },
  { name: '· BÁNH BISCOTTI NGUYÊN CÁM', link: '/products?category=Biscotti' },
  { name: '· HẠT NGŨ CỐC GRANOLA', link: '/products?category=Granola' },
  { name: '· BÁNH NGÓI HẠNH NHÂN KETO', link: '/products?category=B%C3%A1nh+ng%C3%B3i' },
  { name: '· THANH NĂNG LƯỢNG SIÊU HẠT', link: '/products?category=Thanh+h%E1%BA%A1t' },
  { name: '· HẠT & TRÁI CÂY SẤY NHẬP', link: '/products?category=H%E1%BA%A1t' },
  { name: '· Bún, Nui, Mì Gạo Lứt', link: '/products?category=G%E1%BA%A1o+l%E1%BB%A9t' },
  { name: '· Demee - Để Mẹ Lo', link: '/products?category=Demee' },
]

const BLOG_CATEGORIES = [
  { name: 'Kiến thức dinh dưỡng', link: '/blogs?cat=nutrition' },
  { name: 'Ăn uống lành mạnh', link: '/blogs?cat=eat-clean' },
  { name: 'Giảm cân lành mạnh', link: '/blogs?cat=weight-loss' },
]

const CONTACT_ITEMS = [
  { name: 'Tuyển dụng', link: '/contact' },
  { name: 'Chương trình thành viên', link: '/contact' },
  { name: 'Câu hỏi thường gặp', link: '/contact' },
]

const TRENDING_SEARCHES = [
  'Sản phẩm nạp năng lượng, luyện tập',
  'Sản phẩm ít calo',
  'Sản phẩm có GI thấp',
  'Sản phẩm dùng ăn chay',
  'Tính chỉ số BMI',
]

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false)
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const productRef = useRef<HTMLDivElement>(null)
  const blogRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close menus on route change
  useEffect(() => {
    setProductDropdownOpen(false)
    setBlogDropdownOpen(false)
    setContactDropdownOpen(false)
    setUserDropdownOpen(false)
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (productRef.current && !productRef.current.contains(target)) {
        setProductDropdownOpen(false)
      }
      if (blogRef.current && !blogRef.current.contains(target)) {
        setBlogDropdownOpen(false)
      }
      if (contactRef.current && !contactRef.current.contains(target)) {
        setContactDropdownOpen(false)
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const handleTagClick = (tag: string) => {
    if (tag === 'Tính chỉ số BMI') {
      navigate('/bmi-tdee')
    } else {
      navigate(`/products?search=${encodeURIComponent(tag)}`)
    }
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FEFBF4] shadow-[0_2px_8px_rgba(42,39,37,0.04)] font-text">
      {/* 1. TOPBAR ANNOUNCEMENT - Exact HeBekery Terracotta */}
      <div className="bg-[#8F3D1F] text-[#FEFBF4] text-[12px] sm:text-[13px] font-semibold py-2 px-4 text-center tracking-wide">
        <div className="max-w-[1240px] mx-auto flex items-center justify-center">
          <span>Freeship toàn quốc đơn từ 299k • Giao 2h HCM</span>
        </div>
      </div>

      {/* 2. SEARCH POPUP DRAWER / OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white border-b border-[#E5E2DF] shadow-md py-4 px-4"
          >
            <div className="max-w-[800px] mx-auto space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Từ khoá tìm kiếm sản phẩm, calo, hạt..."
                  autoFocus
                  className="w-full pl-4 pr-12 py-2.5 rounded-full text-sm bg-[#FAF7F2] border border-[#E5E2DF] focus:border-[#006561] text-[#2A2725] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Tìm kiếm"
                  className="absolute right-12 text-[#006561] hover:text-[#004e4a] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Đóng tìm kiếm"
                  className="absolute right-3.5 text-[#6B6661] hover:text-[#2A2725] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              {/* Trending Hashtags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[#9A938C] font-medium">Xu hướng:</span>
                {TRENDING_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="inline-flex items-center gap-1 bg-[#FEFBF4] border border-[#E5E2DF] hover:border-[#006561] text-[#6B6661] hover:text-[#006561] px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <span className="text-[#C9785C] font-bold">#</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN NAVBAR */}
      <div className="border-b border-[#E5E2DF]/60">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo Brand: Official HeBekery Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus:outline-none"
            title="HeBekery - Health & Beauty Foods"
          >
            <img
              src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/logo.png?1790765513162"
              alt="HeBekery - Health & Beauty Foods"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* SẢN PHẨM Dropdown */}
            <div className="relative" ref={productRef}>
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
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-full mt-1.5 w-68 rounded-2xl bg-white border border-[#E5E2DF] shadow-lg p-2 z-50 space-y-1"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.link}
                        onClick={() => setProductDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#2A2725] hover:bg-[#FEFBF4] hover:text-[#006561] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="pt-1.5 border-t border-[#E5E2DF]/60">
                      <Link
                        to="/products"
                        onClick={() => setProductDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#006561] bg-[#006561]/6 hover:bg-[#006561]/12 transition-colors"
                      >
                        <span>Xem tất cả sản phẩm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CÂU CHUYỆN */}
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

            {/* COMBO QUÀ */}
            <Link
              to="/products?category=Combo"
              className="px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561] flex items-center gap-1.5 transition-colors"
            >
              <span>Combo quà</span>
            </Link>

            {/* BLOG Dropdown */}
            <div className="relative" ref={blogRef}>
              <button
                type="button"
                onClick={() => setBlogDropdownOpen(!blogDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  location.pathname.startsWith('/blog')
                    ? 'text-[#006561] font-black'
                    : 'text-[#2A2725] hover:text-[#006561]'
                }`}
              >
                <span>Blog</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    blogDropdownOpen ? 'rotate-180 text-[#006561]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {blogDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl bg-white border border-[#E5E2DF] shadow-lg p-2 z-50 space-y-1"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.link}
                        onClick={() => setBlogDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#2A2725] hover:bg-[#FEFBF4] hover:text-[#006561] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="pt-1.5 border-t border-[#E5E2DF]/60">
                      <Link
                        to="/blogs"
                        onClick={() => setBlogDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#006561] bg-[#006561]/6 hover:bg-[#006561]/12 transition-colors"
                      >
                        <span>Tất cả bài viết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DOANH NGHIỆP */}
            <Link
              to="/contact"
              className="px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561] transition-colors"
            >
              Doanh nghiệp
            </Link>

            {/* LIÊN HỆ Dropdown */}
            <div className="relative" ref={contactRef}>
              <button
                type="button"
                onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  location.pathname === '/contact'
                    ? 'text-[#006561] font-black'
                    : 'text-[#2A2725] hover:text-[#006561]'
                }`}
              >
                <span>Liên hệ</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    contactDropdownOpen ? 'rotate-180 text-[#006561]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {contactDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl bg-white border border-[#E5E2DF] shadow-lg p-2 z-50 space-y-1"
                  >
                    {CONTACT_ITEMS.map((item) => (
                      <Link
                        key={item.name}
                        to={item.link}
                        onClick={() => setContactDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#2A2725] hover:bg-[#FEFBF4] hover:text-[#006561] transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Utilities (Exact Circular Icons matching Hebekery) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Tìm kiếm sản phẩm"
              className="w-10 h-10 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:border-[#006561] transition-colors cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User Icon */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="Tài khoản cá nhân"
                    className="w-10 h-10 rounded-full bg-white border border-[#006561] flex items-center justify-center text-[#006561] hover:bg-[#006561]/5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#E5E2DF] shadow-lg p-2 z-50 space-y-1"
                      >
                        <div className="px-3 py-2 border-b border-[#E5E2DF]/60">
                          <p className="text-xs font-bold text-[#2A2725] truncate">
                            {user?.name || 'Khách hàng'}
                          </p>
                          <p className="text-[10px] text-[#6B6661] truncate">{user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#006561] hover:bg-[#006561]/8 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Trang quản trị</span>
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#2A2725] hover:bg-[#FEFBF4] hover:text-[#006561] transition-colors"
                        >
                          Đơn hàng của tôi
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout()
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#B23A2A] hover:bg-[#B23A2A]/8 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Đăng nhập"
                  className="w-10 h-10 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:border-[#006561] transition-colors cursor-pointer shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Shopping Bag Icon with Indicator Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Mở giỏ hàng"
              className="relative w-10 h-10 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:border-[#006561] transition-colors cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#006561] text-[#FEFBF4] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu di động"
              className="lg:hidden w-10 h-10 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#006561] transition-colors cursor-pointer shadow-xs"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-[#E5E2DF] px-4 py-6 space-y-4 shadow-lg overflow-hidden"
          >
            <div className="space-y-1">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Sản phẩm
              </Link>
              <div className="pl-3 space-y-1 border-l-2 border-[#E5E2DF]/60 py-1">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-xs text-[#6B6661] hover:text-[#006561]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Câu chuyện
              </Link>
              <Link
                to="/products?category=Combo"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Combo quà
              </Link>
              <Link
                to="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Blog
              </Link>
              <Link
                to="/bmi-tdee"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Tính Calo &amp; BMI
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold uppercase tracking-wider text-[#2A2725] hover:text-[#006561]"
              >
                Liên hệ
              </Link>
            </div>

            <div className="pt-3 border-t border-[#E5E2DF]/60 flex items-center justify-between">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-[#2A2725]">
                    {user?.name || 'Khách hàng'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-xs font-bold text-[#B23A2A]"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#006561] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
