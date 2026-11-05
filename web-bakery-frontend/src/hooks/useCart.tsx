import React, { createContext, useContext, useState, useEffect } from 'react'
import type { CartItem, Product } from '@/types'
import { cartApi } from '@/api'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'hebekery_guest_cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Nạp giỏ hàng từ server khi đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadServerCart()
    }
  }, [isAuthenticated])

  // Lưu giỏ hàng khách vào localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isAuthenticated])

  const loadServerCart = async () => {
    try {
      setIsLoading(true)
      // Nếu có giỏ hàng khách trước đó, đồng bộ lên server
      const localGuestCart = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (localGuestCart) {
        const guestItems: CartItem[] = JSON.parse(localGuestCart)
        if (guestItems.length > 0) {
          await cartApi.syncCart(guestItems)
          localStorage.removeItem(LOCAL_STORAGE_KEY)
        }
      }
      const res = await cartApi.getCart()
      setItems(res.items || [])
    } catch {
      // Ignored
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      toast.error('Sản phẩm hiện đang tạm hết hàng!')
      return
    }

    if (isAuthenticated) {
      try {
        const res = await cartApi.addToCart(product.id, quantity)
        setItems(res.items || [])
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng`)
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể thêm vào giỏ hàng'
        toast.error(message)
      }
    } else {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.productId === product.id)
        if (existingIndex > -1) {
          const newItems = [...prev]
          const newQty = newItems[existingIndex].quantity + quantity
          newItems[existingIndex].quantity = newQty
          newItems[existingIndex].total = newQty * product.price
          return newItems
        } else {
          return [
            ...prev,
            {
              productId: product.id,
              productName: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
              quantity,
              total: product.price * quantity,
            },
          ]
        }
      })
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }

    if (isAuthenticated) {
      try {
        const res = await cartApi.updateQuantity(productId, quantity)
        setItems(res.items || [])
      } catch {
        toast.error('Không thể cập nhật số lượng')
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity, total: quantity * item.price }
            : item
        )
      )
    }
  }

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await cartApi.removeFromCart(productId)
        setItems(res.items || [])
        toast.success('Đã xóa sản phẩm khỏi giỏ')
      } catch {
        toast.error('Không thể xóa sản phẩm')
      }
    } else {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
      toast.success('Đã xóa sản phẩm khỏi giỏ')
    }
  }

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart()
        setItems([])
      } catch {
        // Ignored
      }
    } else {
      setItems([])
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
