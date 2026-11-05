import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User as UserIcon, Menu, X, Shield } from 'lucide-react'
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
    <header className="sticky top-0 z-40 w-full border-b border-[#e7e5e4] bg-[#faf8f5]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#47654c] text-white flex items-center justify-center font-bold text-lg select-none">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider text-[#1c1917] uppercase">
              Hebekery
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#47654c] font-semibold -mt-1">
              Healthy Bakery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#292524]">
          <Link to="/" className="hover:text-[#47654c] transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/products" className="hover:text-[#47654c] transition-colors">
            {t('nav.products')}
          </Link>
          <Link to="/about" className="hover:text-[#47654c] transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/bmi-tdee" className="hover:text-[#47654c] transition-colors">
            {t('nav.bmi')}
          </Link>
          <Link to="/contact" className="hover:text-[#47654c] transition-colors">
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2 py-1 border border-[#e7e5e4] hover:bg-black/5 transition-colors cursor-pointer"
            title="Đổi ngôn ngữ"
          >
            {i18n.language.startsWith('en') ? '🇻🇳 VI' : '🇬🇧 EN'}
          </button>

          {/* Cart Icon with Motion Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#1c1917] hover:text-[#47654c] hover:bg-black/5 transition-colors cursor-pointer select-none"
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
                  className="absolute -top-1 -right-1 bg-[#d97724] text-white text-[11px] font-bold h-5 min-w-5 px-1 flex items-center justify-center leading-none"
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
                  className="hidden sm:inline-flex items-center gap-1 border-[#47654c] text-[#47654c]"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {t('nav.admin')}
                </Button>
              )}
              <div className="relative group">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => navigate('/profile')}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#47654c]" />
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                {t('nav.login')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/register')}
                className="hidden sm:inline-flex"
              >
                {t('nav.register')}
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1c1917] hover:bg-black/5 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-[#e7e5e4] bg-[#faf8f5] px-4 py-4 space-y-3"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1 text-[#292524] hover:text-[#47654c]"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1 text-[#292524] hover:text-[#47654c]"
            >
              {t('nav.products')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1 text-[#292524] hover:text-[#47654c]"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/bmi-tdee"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1 text-[#292524] hover:text-[#47654c]"
            >
              {t('nav.bmi')}
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1 text-[#292524] hover:text-[#47654c]"
            >
              {t('nav.contact')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
