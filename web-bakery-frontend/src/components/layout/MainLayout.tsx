import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/common/CartDrawer'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFBF4] text-[#2A2725] font-text antialiased selection:bg-[#006561]/20 selection:text-[#006561]">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
