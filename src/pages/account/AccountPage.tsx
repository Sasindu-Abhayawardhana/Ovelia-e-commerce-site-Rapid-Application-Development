import { Link, Outlet, useLocation } from 'react-router-dom'
import { User, Package, MapPin, Settings, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Overview',     href: '/account',          icon: User },
  { label: 'My Orders',    href: '/account/orders',   icon: Package },
  { label: 'Profile',      href: '/account/profile',  icon: Settings },
]

export function AccountPage() {
  const location = useLocation()
  const user     = useAuthStore(s => s.user)
  const profile  = useAuthStore(s => s.profile)
  const isRoot   = location.pathname === '/account'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-8">My Account</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="card p-5 space-y-1">
            {/* Avatar */}
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-cream-200">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600 font-semibold text-lg">
                  {profile?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-charcoal-900 truncate">{profile?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  location.pathname === href
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-gray-600 hover:bg-cream-100 hover:text-charcoal-900',
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">
          {isRoot ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NAV_ITEMS.slice(1).map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className="card p-6 flex items-center justify-between group hover:shadow-lift transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-terracotta-500" />
                    </div>
                    <span className="font-medium text-charcoal-900">{label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-terracotta-500 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  )
}
