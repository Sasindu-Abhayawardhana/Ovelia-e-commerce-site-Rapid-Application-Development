import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveCart, loadCart, validatePromoCode } from '@/lib/firestore'
import { calculateTax, calculateShipping } from '@/lib/utils'
import type { CartItem, PromoCode } from '@/types'

interface CartState {
  items:     CartItem[]
  promoCode: PromoCode | null
  userId:    string | null
  syncing:   boolean

  // Actions
  addItem:          (item: CartItem) => void
  removeItem:       (productId: string, variantId?: string) => void
  updateQuantity:   (productId: string, quantity: number, variantId?: string) => void
  clearCart:        () => void
  applyPromoCode:   (code: string) => Promise<{ success: boolean; message: string }>
  removePromoCode:  () => void
  setUserId:        (uid: string | null) => void
  syncFromFirestore:(uid: string) => Promise<void>
  persistToFirestore: () => Promise<void>

  // Computed (derived)
  subtotal:   () => number
  discount:   () => number
  tax:        () => number
  shipping:   () => number
  total:      () => number
  itemCount:  () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:     [],
      promoCode: null,
      userId:    null,
      syncing:   false,

      addItem: (newItem) => {
        const items = get().items
        const key = (i: CartItem) => i.productId + (i.variantId ?? '')
        const existing = items.find(i => key(i) === key(newItem))

        const updated = existing
          ? items.map(i =>
              key(i) === key(newItem)
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i,
            )
          : [...items, newItem]

        set({ items: updated })
        const { userId } = get()
        if (userId) get().persistToFirestore()
      },

      removeItem: (productId, variantId) => {
        set(s => ({
          items: s.items.filter(
            i => !(i.productId === productId && i.variantId === variantId),
          ),
        }))
        const { userId } = get()
        if (userId) get().persistToFirestore()
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set(s => ({
          items: s.items.map(i =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i,
          ),
        }))
        const { userId } = get()
        if (userId) get().persistToFirestore()
      },

      clearCart: () => {
        set({ items: [], promoCode: null })
        const { userId } = get()
        if (userId) saveCart(userId, [])
      },

      applyPromoCode: async (code) => {
        const subtotal = get().subtotal()
        const promo = await validatePromoCode(code, subtotal)
        if (!promo) {
          return { success: false, message: 'Invalid or expired promo code.' }
        }
        set({ promoCode: promo })
        return { success: true, message: `Code "${promo.code}" applied! You saved ${promo.type === 'percentage' ? promo.value + '%' : '$' + promo.value}.` }
      },

      removePromoCode: () => set({ promoCode: null }),

      setUserId: (uid) => set({ userId: uid }),

      syncFromFirestore: async (uid) => {
        set({ syncing: true })
        try {
          const firestoreItems = await loadCart(uid)
          if (firestoreItems.length > 0) {
            // Merge: keep Firestore as source of truth for logged-in users
            set({ items: firestoreItems })
          } else {
            // Push localStorage cart to Firestore
            const localItems = get().items
            if (localItems.length > 0) {
              await saveCart(uid, localItems)
            }
          }
        } finally {
          set({ syncing: false })
        }
      },

      persistToFirestore: async () => {
        const { userId, items } = get()
        if (userId) await saveCart(userId, items)
      },

      // Computed
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      discount: () => {
        const { promoCode } = get()
        if (!promoCode) return 0
        const subtotal = get().subtotal()
        if (promoCode.type === 'percentage') {
          return Math.round(subtotal * (promoCode.value / 100) * 100) / 100
        }
        return Math.min(promoCode.value, subtotal)
      },

      tax: () => {
        const subtotal = get().subtotal() - get().discount()
        return calculateTax(Math.max(0, subtotal))
      },

      shipping: () => {
        const subtotal = get().subtotal() - get().discount()
        return calculateShipping(Math.max(0, subtotal))
      },

      total: () => {
        const subtotal = get().subtotal()
        const discount = get().discount()
        const tax      = get().tax()
        const shipping = get().shipping()
        return Math.max(0, subtotal - discount + tax + shipping)
      },

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'Ovelia-cart',
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
    },
  ),
)
