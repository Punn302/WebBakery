import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/common/CartDrawer'
import { Gift } from 'lucide-react'

export const MainLayout: React.FC = () => {
  const location = useLocation()
  const isProductDetail = location.pathname.startsWith('/products/')

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2A2725] font-text antialiased selection:bg-[#006561]/20 selection:text-[#006561] relative">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />

      {/* Floating Widget 1: Bottom-Left Loyalty Member Button */}
      <div
        className={`fixed left-4 sm:left-5 z-30 transition-all duration-300 ${
          isProductDetail ? 'bottom-20 sm:bottom-5' : 'bottom-5'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            window.location.href = '/contact'
          }}
          className="inline-flex items-center gap-2 bg-[#0088FF] hover:bg-[#0077EE] text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer min-h-[44px]"
          aria-label="Thành viên thân thiết"
        >
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">Thành viên thân thiết</span>
        </button>
      </div>

      {/* Floating Widget 2: Bottom-Right Zalo Chat Button */}
      <div
        className={`fixed right-4 sm:right-5 z-30 transition-all duration-300 ${
          isProductDetail ? 'bottom-20 sm:bottom-5' : 'bottom-5'
        }`}
      >
        <a
          href="https://zalo.me/0979764185"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat qua Zalo với HeBekery"
          className="w-12 h-12 rounded-full bg-[#0068FF] hover:bg-[#0055DD] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer min-w-[44px] min-h-[44px]"
        >
          <span className="font-bold text-[13px] tracking-tight">Zalo</span>
        </a>
      </div>
    </div>
  )
}
