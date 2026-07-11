import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, User, Menu, X,
  ChevronDown, LogOut, Package, Settings,
} from 'lucide-react'
import { useAuthStore }     from '@/store/authStore'
import { useCartStore }     from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUIStore }       from '@/store/uiStore'
import { useDebounce }      from '@/hooks/useDebounce'
import { searchProducts }   from '@/lib/firestore'
import { cn }               from '@/lib/utils'
import type { Product }     from '@/types'

const NAV_LINKS = [
  { label: 'Shop',         href: '/shop' },
  { label: 'Home & Living',href: '/shop?category=Home+%26+Living' },
  { label: 'Apparel',      href: '/shop?category=Apparel' },
  { label: 'Accessories',  href: '/shop?category=Accessories' },
]

export function Header() {
  const [scrolled,       setScrolled]      = useState(false)
  const [accountOpen,    setAccountOpen]   = useState(false)
  const [searchResults,  setSearchResults] = useState<Product[]>([])
  const [searching,      setSearching]     = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const navigate    = useNavigate()
  const user        = useAuthStore(s => s.user)
  const isAdmin     = useAuthStore(s => s.isAdmin)
  const signOut     = useAuthStore(s => s.signOut)
  const itemCount   = useCartStore(s => s.itemCount())
  const wishCount   = useWishlistStore(s => s.items.length)

  const {
    cartDrawerOpen, toggleCartDrawer,
    mobileMenuOpen, toggleMobileMenu, closeMobileMenu,
    searchOpen, setSearchOpen, searchQuery, setSearchQuery,
  } = useUIStore()

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Live search
  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return }
    setSearching(true)
    searchProducts(debouncedSearch)
      .then(setSearchResults)
      .finally(() => setSearching(false))
  }, [debouncedSearch])

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchResults([])
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-cream-50/90 backdrop-blur-sm',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-terracotta-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">A</span>
              </div>
              <span className="font-serif text-2xl font-semibold text-charcoal-900 tracking-tight">
                Ovelia
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link key={link.href} to={link.href} className="nav-link text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl hover:bg-cream-200 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-charcoal-800" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-lift border border-cream-200 overflow-hidden"
                  >
                    <form onSubmit={handleSearchSubmit} className="p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          autoFocus
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search products…"
                          className="w-full pl-9 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
                        />
                      </div>
                    </form>

                    {searchResults.length > 0 && (
                      <div className="border-t border-cream-200">
                        {searchResults.slice(0, 5).map(p => (
                          <Link
                            key={p.id}
                            to={`/shop/${p.slug}`}
                            onClick={() => { setSearchOpen(false); setSearchResults([]) }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition-colors"
                          >
                            <img
                              src={p.images[0] ?? 'https://placehold.co/48x48/F9F3EB/C17F5A?text=A'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-charcoal-900 line-clamp-1">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.category}</p>
                            </div>
                          </Link>
                        ))}
                        <div className="px-4 py-2 border-t border-cream-200">
                          <button
                            onClick={handleSearchSubmit as any}
                            className="text-sm text-terracotta-500 hover:underline"
                          >
                            See all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-cream-200 transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5 text-charcoal-800" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-2.5 rounded-xl hover:bg-cream-200 transition-colors"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5 text-charcoal-800" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Account */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen(o => !o)}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-cream-200 transition-colors"
                aria-label="Account menu"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-charcoal-800" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-lift border border-cream-200 py-2 overflow-hidden"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-cream-200">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-medium text-charcoal-800 truncate">{user.email}</p>
                        </div>
                        <Link to="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-800 hover:bg-cream-50 transition-colors">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-800 hover:bg-cream-50 transition-colors">
                          <Package className="w-4 h-4" /> Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-terracotta-600 hover:bg-cream-50 transition-colors">
                            <Settings className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-cream-200 mt-1">
                          <button
                            onClick={() => { signOut(); setAccountOpen(false) }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-800 hover:bg-cream-50 transition-colors">
                          Sign in
                        </Link>
                        <Link to="/signup" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-terracotta-500 font-medium hover:bg-cream-50 transition-colors">
                          Create account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 rounded-xl hover:bg-cream-200 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-cream-200 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={closeMobileMenu}
                  className="block py-3 px-3 rounded-xl text-charcoal-800 hover:bg-cream-100 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-cream-200 pt-3 mt-2">
                {user ? (
                  <>
                    <Link to="/account" onClick={closeMobileMenu} className="block py-3 px-3 rounded-xl text-charcoal-800 hover:bg-cream-100 transition-colors">My Account</Link>
                    <Link to="/account/orders" onClick={closeMobileMenu} className="block py-3 px-3 rounded-xl text-charcoal-800 hover:bg-cream-100 transition-colors">Orders</Link>
                    {isAdmin && <Link to="/admin" onClick={closeMobileMenu} className="block py-3 px-3 rounded-xl text-terracotta-600 hover:bg-cream-100 transition-colors">Admin Panel</Link>}
                    <button onClick={() => { signOut(); closeMobileMenu() }} className="block w-full text-left py-3 px-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu} className="block py-3 px-3 rounded-xl text-charcoal-800 hover:bg-cream-100 transition-colors">Sign in</Link>
                    <Link to="/signup" onClick={closeMobileMenu} className="block py-3 px-3 rounded-xl text-terracotta-500 font-medium hover:bg-cream-100 transition-colors">Create account</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
