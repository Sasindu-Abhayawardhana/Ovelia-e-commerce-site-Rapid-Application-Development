import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'

export function OrderConfirmationPage() {
  const [params]  = useSearchParams()
  const orderId   = params.get('orderId') ?? params.get('session_id')
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-3">
          Order Confirmed! 🎉
        </h1>
        <p className="text-gray-500 text-lg mb-2">
          Thank you for shopping with Ovelia.
        </p>
        {orderId && (
          <p className="text-sm text-gray-400 mb-8">
            Order reference: <span className="font-mono text-charcoal-800">{orderId.slice(0, 12)}…</span>
          </p>
        )}

        <div className="bg-cream-50 rounded-2xl p-6 mb-8 text-left space-y-2">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-terracotta-500" />
            <div>
              <p className="font-medium text-charcoal-900">What happens next?</p>
              <p className="text-sm text-gray-500">We'll send you a shipping confirmation email within 24 hours.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account/orders">
            <Button icon={<Package className="w-4 h-4" />}>
              View My Orders
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
