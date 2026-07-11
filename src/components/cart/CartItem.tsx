import { motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import type { CartItem } from '@/types'

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const removeItem     = useCartStore(s => s.removeItem)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 group"
    >
      {/* Image */}
      <Link to={`/shop/${item.slug}`} className="flex-shrink-0">
        <img
          src={item.image || 'https://placehold.co/72x72/F9F3EB/C17F5A?text=A'}
          alt={item.name}
          className="w-18 h-18 w-[72px] h-[72px] rounded-xl object-cover bg-cream-100"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/shop/${item.slug}`}>
          <p className="font-medium text-charcoal-900 text-sm leading-snug line-clamp-2 hover:text-terracotta-600 transition-colors">
            {item.name}
          </p>
        </Link>
        {item.variant && (
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {item.variant.type}: {item.variant.label}
          </p>
        )}
        <p className="text-sm font-semibold text-terracotta-600 mt-1">
          {formatCurrency(item.price)}
        </p>

        {/* Quantity */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
            className="w-6 h-6 rounded-lg bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
            className="w-6 h-6 rounded-lg bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Remove + total */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.productId, item.variantId)}
          className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          aria-label="Remove item"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-charcoal-800">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </motion.div>
  )
}
