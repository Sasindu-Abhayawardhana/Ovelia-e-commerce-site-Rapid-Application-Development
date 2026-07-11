import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Truck, Package } from 'lucide-react'
import { getOrder }           from '@/lib/firestore'
import { OrderStatusBadge }   from '@/components/ui/Badge'
import { Skeleton }           from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

const STATUS_STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered']

export function OrderDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const [order, setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) getOrder(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}
    </div>
  )

  if (!order) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Order not found.</p>
      <Link to="/account/orders" className="text-terracotta-500 hover:underline mt-2 block">← Back to orders</Link>
    </div>
  )

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/account/orders" className="p-2 rounded-xl hover:bg-cream-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-charcoal-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto"><OrderStatusBadge status={order.status} /></div>
      </div>

      {/* Status tracker */}
      {order.status !== 'Cancelled' && (
        <div className="card p-6">
          <h3 className="font-medium text-charcoal-900 mb-5">Order Status</h3>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i <= currentStep ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-gray-400'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">{step}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < currentStep ? 'bg-terracotta-400' : 'bg-cream-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-6">
        <h3 className="font-medium text-charcoal-900 mb-4">Items Ordered</h3>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
              <img src={item.image || 'https://placehold.co/60x60/F9F3EB/C17F5A?text=A'} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to={`/shop/${item.slug}`} className="font-medium text-charcoal-900 hover:text-terracotta-600">
                  {item.name}
                </Link>
                {item.variant && <p className="text-xs text-gray-400">{item.variant.type}: {item.variant.label}</p>}
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping address */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <h3 className="font-medium text-charcoal-900">Shipping Address</h3>
          </div>
          <address className="text-sm text-gray-600 not-italic space-y-0.5">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </address>
        </div>

        {/* Order summary */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-terracotta-500" />
            <h3 className="font-medium text-charcoal-900">Order Summary</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(order.tax)}</span></div>
            <div className="flex justify-between font-semibold text-base border-t border-cream-200 pt-2">
              <span>Total</span><span className="text-terracotta-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
