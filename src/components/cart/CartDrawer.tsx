import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore }  from '@/store/cartStore'
import { useUIStore }    from '@/store/uiStore'
import { CartItemRow }   from './CartItem'
import { CartSummary }   from './CartSummary'
import { EmptyState }    from '@/components/ui/EmptyState'
import { Button }        from '@/components/ui/Button'

export function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer } = useUIStore()
  const items = useCartStore(s => s.items)

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeCartDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lift z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-terracotta-500" />
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  Your Cart ({items.length})
                </h2>
              </div>
              <button
                onClick={closeCartDrawer}
                className="p-2 rounded-xl hover:bg-cream-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <EmptyState
                  type="cart"
                  action={
                    <Button
                      variant="secondary"
                      onClick={closeCartDrawer}
                      icon={<ShoppingBag className="w-4 h-4" />}
                    >
                      Continue Shopping
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Summary + CTA */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 px-6 py-5 space-y-4 bg-cream-50">
                <CartSummary compact />
                <Link to="/checkout" onClick={closeCartDrawer}>
                  <Button className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                    Checkout
                  </Button>
                </Link>
                <Link to="/cart" onClick={closeCartDrawer}>
                  <button className="w-full text-sm text-terracotta-500 hover:underline text-center">
                    View full cart
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
