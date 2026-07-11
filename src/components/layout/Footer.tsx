import { Link } from 'react-router-dom'
import { Globe, AtSign, Share2, Mail } from 'lucide-react'

const LINKS = {
  shop:    [{ label: 'All Products',   href: '/shop' }, { label: 'Home & Living', href: '/shop?category=Home+%26+Living' }, { label: 'Apparel', href: '/shop?category=Apparel' }, { label: 'Accessories', href: '/shop?category=Accessories' }, { label: 'Stationery', href: '/shop?category=Stationery' }],
  account: [{ label: 'My Account', href: '/account' }, { label: 'Orders', href: '/account/orders' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'Sign In', href: '/login' }],
  info:    [{ label: 'About Us', href: '#' }, { label: 'Shipping Policy', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Contact', href: '#' }],
}

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-terracotta-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">A</span>
              </div>
              <span className="font-serif text-2xl font-semibold text-white">Ovelia</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Curated lifestyle goods for the modern home. Quality, warmth, and intention in every piece.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe,   label: 'Instagram', href: '#' },
                { icon: AtSign,  label: 'Twitter',   href: '#' },
                { icon: Share2,  label: 'Facebook',  href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-terracotta-500 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {LINKS.shop.map(l => (
                <li key={l.href}><Link to={l.href} className="text-sm text-gray-400 hover:text-terracotta-300 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2.5">
              {LINKS.account.map(l => (
                <li key={l.href}><Link to={l.href} className="text-sm text-gray-400 hover:text-terracotta-300 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info + Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Information</h4>
            <ul className="space-y-2.5 mb-6">
              {LINKS.info.map(l => (
                <li key={l.href}><a href={l.href} className="text-sm text-gray-400 hover:text-terracotta-300 transition-colors">{l.label}</a></li>
              ))}
            </ul>
            <p className="text-sm text-gray-400 mb-2">Newsletter</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
              />
              <button className="p-2 bg-terracotta-500 rounded-xl hover:bg-terracotta-600 transition-colors" aria-label="Subscribe">
                <Mail className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Ovelia. All rights reserved.</p>
          <p>Made with ♥ for modern living</p>
        </div>
      </div>
    </footer>
  )
}
