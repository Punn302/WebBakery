import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/common/CartDrawer'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFBF4] text-[#2A2725] font-text">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
