import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Star, LogOut, ChevronRight, Settings, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/admin',           icon: LayoutDashboard },
  { label: 'Products',    href: '/admin/products',  icon: Package },
  { label: 'Orders',      href: '/admin/orders',    icon: ShoppingBag },
  { label: 'Customers',   href: '/admin/customers', icon: Users },
  { label: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
  { label: 'Reviews',     href: '/admin/reviews',   icon: Star },
  { label: 'Settings',    href: '/admin/settings',  icon: Settings },
]

export function AdminLayout() {
  const signOut  = useAuthStore(s => s.signOut)
  const user     = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-terracotta-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">O</span>
          </div>
          <div>
            <p className="font-serif font-semibold text-white">Ovelia</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/admin'}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-terracotta-500 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-terracotta-500 flex items-center justify-center text-sm font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.displayName ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink
          to="/"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors mb-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Store
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-cream-200 z-20 flex items-center px-4">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-charcoal-900">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-serif font-bold text-lg ml-2">Ovelia Admin</span>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-charcoal-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 pt-16 md:pt-0">
        <main className="p-4 md:p-8 min-h-screen max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
