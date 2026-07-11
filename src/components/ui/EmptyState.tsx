import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Search, PackageOpen } from 'lucide-react'

type EmptyStateType = 'cart' | 'wishlist' | 'search' | 'orders' | 'products' | 'generic'

interface EmptyStateProps {
  type?:        EmptyStateType
  title?:       string
  description?: string
  action?:      React.ReactNode
}

const config: Record<EmptyStateType, { icon: React.ReactNode; title: string; desc: string }> = {
  cart:     { icon: <ShoppingBag className="w-16 h-16 text-terracotta-300" />, title: 'Your cart is empty',     desc: 'Looks like you haven\'t added anything yet.' },
  wishlist: { icon: <Heart className="w-16 h-16 text-terracotta-300" />,       title: 'No saved items',          desc: 'Heart products you love to save them here.' },
  search:   { icon: <Search className="w-16 h-16 text-terracotta-300" />,      title: 'No results found',        desc: 'Try different keywords or browse our catalog.' },
  orders:   { icon: <PackageOpen className="w-16 h-16 text-terracotta-300" />, title: 'No orders yet',           desc: 'Your order history will appear here.' },
  products: { icon: <ShoppingBag className="w-16 h-16 text-terracotta-300" />, title: 'No products found',       desc: 'Try adjusting your filters.' },
  generic:  { icon: <PackageOpen className="w-16 h-16 text-terracotta-300" />, title: 'Nothing here yet',        desc: '' },
}

export function EmptyState({ type = 'generic', title, description, action }: EmptyStateProps) {
  const c = config[type]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-6 p-6 bg-cream-100 rounded-full"
      >
        {c.icon}
      </motion.div>
      <h3 className="font-serif text-2xl font-semibold text-charcoal-900 mb-2">
        {title ?? c.title}
      </h3>
      {(description ?? c.desc) && (
        <p className="text-gray-500 mb-6 max-w-sm">{description ?? c.desc}</p>
      )}
      {action}
    </motion.div>
  )
}
