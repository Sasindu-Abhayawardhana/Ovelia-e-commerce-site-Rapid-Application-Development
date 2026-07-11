import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Timestamp } from 'firebase/firestore'
import { saveWishlist, loadWishlist } from '@/lib/firestore'
import type { WishlistItem } from '@/types'

interface WishlistState {
  items:  WishlistItem[]
  userId: string | null

  addItem:          (productId: string) => void
  removeItem:       (productId: string) => void
  isInWishlist:     (productId: string) => boolean
  setUserId:        (uid: string | null) => void
  syncFromFirestore:(uid: string) => Promise<void>
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items:  [],
      userId: null,

      addItem: (productId) => {
        if (get().isInWishlist(productId)) return
        const newItems: WishlistItem[] = [
          ...get().items,
          { productId, addedAt: Timestamp.now() },
        ]
        set({ items: newItems })
        const { userId } = get()
        if (userId) saveWishlist(userId, newItems)
      },

      removeItem: (productId) => {
        const newItems = get().items.filter(i => i.productId !== productId)
        set({ items: newItems })
        const { userId } = get()
        if (userId) saveWishlist(userId, newItems)
      },

      isInWishlist: (productId) =>
        get().items.some(i => i.productId === productId),

      setUserId: (uid) => set({ userId: uid }),

      syncFromFirestore: async (uid) => {
        const firestoreItems = await loadWishlist(uid)
        set({ items: firestoreItems })
      },
    }),
    {
      name: 'Ovelia-wishlist',
      partialize: (s) => ({ items: s.items }),
    },
  ),
)
