import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { PromoCodeInput } from './PromoCodeInput'

interface CartSummaryProps {
  compact?: boolean
  showPromo?: boolean
}

export function CartSummary({ compact = false, showPromo = false }: CartSummaryProps) {
  const subtotal  = useCartStore(s => s.subtotal())
  const discount  = useCartStore(s => s.discount())
  const tax       = useCartStore(s => s.tax())
  const shipping  = useCartStore(s => s.shipping())
  const total     = useCartStore(s => s.total())
  const promoCode = useCartStore(s => s.promoCode)

  const lineClass = 'flex justify-between text-sm'

  return (
    <div className="space-y-3">
      {showPromo && !compact && <PromoCodeInput />}

      <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
        <div className={lineClass}>
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className={`${lineClass} text-green-600`}>
            <span>Discount ({promoCode?.code})</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        )}

        <div className={lineClass}>
          <span className="text-gray-500">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatCurrency(shipping)
            )}
          </span>
        </div>

        {!compact && subtotal - discount < 75 && (
          <p className="text-xs text-terracotta-500">
            Add {formatCurrency(75 - (subtotal - discount))} more for free shipping!
          </p>
        )}

        <div className={lineClass}>
          <span className="text-gray-500">Tax (8.5%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>

        <div className="border-t border-cream-200 pt-2">
          <div className="flex justify-between font-semibold text-base">
            <span className="text-charcoal-900">Total</span>
            <span className="text-terracotta-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
