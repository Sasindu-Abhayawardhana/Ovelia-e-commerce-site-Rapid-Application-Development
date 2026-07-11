import { create } from 'zustand'
import type { ProductFilters, SortOption } from '@/types'

interface UIState {
  searchQuery:     string
  filters:         ProductFilters
  sortBy:          SortOption
  cartDrawerOpen:  boolean
  mobileMenuOpen:  boolean
  searchOpen:      boolean

  setSearchQuery:  (q: string) => void
  setFilter:       (key: keyof ProductFilters, value: ProductFilters[keyof ProductFilters]) => void
  setSortBy:       (sort: SortOption) => void
  resetFilters:    () => void
  toggleCartDrawer:() => void
  openCartDrawer:  () => void
  closeCartDrawer: () => void
  toggleMobileMenu:() => void
  closeMobileMenu: () => void
  setSearchOpen:   (open: boolean) => void
}

const defaultFilters: ProductFilters = {}

export const useUIStore = create<UIState>((set) => ({
  searchQuery:    '',
  filters:        defaultFilters,
  sortBy:         'newest',
  cartDrawerOpen: false,
  mobileMenuOpen: false,
  searchOpen:     false,

  setSearchQuery:   (q) => set({ searchQuery: q }),
  setFilter:        (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
  setSortBy:        (sort) => set({ sortBy: sort }),
  resetFilters:     () => set({ filters: defaultFilters, sortBy: 'newest', searchQuery: '' }),
  toggleCartDrawer: () => set(s => ({ cartDrawerOpen: !s.cartDrawerOpen })),
  openCartDrawer:   () => set({ cartDrawerOpen: true }),
  closeCartDrawer:  () => set({ cartDrawerOpen: false }),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu:  () => set({ mobileMenuOpen: false }),
  setSearchOpen:    (open) => set({ searchOpen: open }),
}))
