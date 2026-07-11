import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { CartItemRow }  from '@/components/cart/CartItem'
import { CartSummary }  from '@/components/cart/CartSummary'
import { PromoCodeInput } from '@/components/cart/PromoCodeInput'
import { EmptyState }   from '@/components/ui/EmptyState'
import { Button }       from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'

export function CartPage() {
  const items = useCartStore(s => s.items)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          type="cart"
          action={
            <Link to="/shop">
              <Button icon={<ShoppingBag className="w-4 h-4" />}>
                Continue Shopping
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="card p-6 space-y-6">
              <AnimatePresence>
                {items.map(item => (
                  <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4">
              <Link to="/shop" className="flex items-center gap-2 text-sm text-terracotta-500 hover:underline">
                ← Continue shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal-900 mb-5">Order Summary</h2>
              <PromoCodeInput />
              <div className="mt-5">
                <CartSummary />
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Proceed to Checkout
              </Button>
            </Link>

            <div className="text-center text-xs text-gray-400 space-y-1">
              <p>🔒 Secure SSL checkout</p>
              <p>All major cards accepted via Stripe</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
