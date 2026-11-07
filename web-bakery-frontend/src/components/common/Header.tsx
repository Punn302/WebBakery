import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User as UserIcon, Menu, X, Shield, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'vi' : 'en'
    i18n.changeLanguage(nextLang)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eadbce] bg-[#faf8f5]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo Cluster */}
        <Link to="/" className="flex flex-col items-start group select-none">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.webp"
              alt="Hebekery"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <span className="text-[10px] tracking-widest text-[#78716c] uppercase font-semibold -mt-0.5">
            Tiệm Bánh Dinh Dưỡng &amp; Ăn Kiêng
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#292524]">
          <Link to="/" className="hover:text-[#4a3728] transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/products" className="hover:text-[#4a3728] transition-colors">
            {t('nav.products')}
          </Link>
          <Link to="/about" className="hover:text-[#4a3728] transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/bmi-tdee" className="hover:text-[#4a3728] transition-colors">
            {t('nav.bmi')}
          </Link>
          <Link to="/contact" className="hover:text-[#4a3728] transition-colors">
            {t('nav.contact')}
          </Link>
          <Link
            to="/tracking"
            className="hover:text-[#4a3728] transition-colors flex items-center gap-1.5 text-[#d97724] font-semibold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('nav.tracking')}</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2.5 py-1 border border-[#eadbce] rounded-full hover:bg-black/5 transition-colors cursor-pointer select-none bg-white/60"
            title={i18n.language.startsWith('vi') ? 'Chuyển sang English' : 'Chuyển sang Tiếng Việt'}
          >
            {i18n.language.startsWith('vi') ? '🇻🇳 VI' : '🇬🇧 EN'}
          </button>

          {/* Cart Icon with Amber Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-[#1c1917] hover:text-[#4a3728] hover:bg-black/5 rounded-full transition-colors cursor-pointer select-none"
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
                  className="absolute top-1 right-1 bg-[#d97724] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center leading-none shadow-sm"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User Account / Admin */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold border-[#eadbce] text-[#47654c] hover:bg-[#47654c]/10 rounded-full"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Quản trị</span>
                </Button>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#eadbce] bg-white text-[#1c1917] hover:bg-[#f4efea] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#4a3728]" />
                <span className="hidden sm:inline truncate max-w-[120px]">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-[#78716c] hover:text-[#dc2626] font-medium transition-colors ml-1 cursor-pointer"
              >
                {t('nav.logout', 'Đăng xuất')}
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold text-xs px-5 py-2 rounded-full shadow-sm cursor-pointer transition-colors"
            >
              {t('nav.login', 'Đăng nhập')}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1c1917] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#eadbce] bg-[#faf8f5] px-4 pt-3 pb-6 space-y-3"
          >
            <nav className="flex flex-col space-y-2 text-sm font-medium text-[#292524]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors"
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors"
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/bmi-tdee"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors"
              >
                {t('nav.bmi')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors"
              >
                {t('nav.contact')}
              </Link>
              <Link
                to="/tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f4efea] transition-colors text-[#d97724] font-semibold flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{t('nav.tracking')}</span>
              </Link>
            </nav>

            {isAuthenticated && isAdmin && (
              <div className="pt-2 border-t border-[#eadbce]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/admin/dashboard')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold border-[#eadbce] text-[#47654c] rounded-full"
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
