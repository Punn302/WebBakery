import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface WishlistContextType {
  wishlist: Product[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'hebekery_wishlist'

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
    } catch {
      // Ignore write errors
    }
  }, [wishlist])

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      if (exists) {
        toast.info(`Đã gỡ "${product.name}" khỏi danh sách yêu thích`)
        return prev.filter((item) => item.id !== product.id)
      } else {
        toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích ❤️`)
        return [...prev, product]
      }
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  isInWishlist: () => false,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
  wishlistCount: 0,
}

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext)
  return context || defaultWishlistContext
}
