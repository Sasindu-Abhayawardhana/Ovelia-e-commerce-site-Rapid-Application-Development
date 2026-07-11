import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateOrderStatus } from '@/lib/firestore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Order, OrderStatus } from '@/types'
import toast from 'react-hot-toast'

const STATUSES: OrderStatus[] = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'orders', id)).then((snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as Order)
      }
      setLoading(false)
    })
  }, [id])

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return
    try {
      await updateOrderStatus(order.id, status)
      setOrder({ ...order, status })
      toast.success(`Order status updated to ${status}`)
    } catch {
      toast.error('Failed to update status.')
    }
  }

  if (loading) return <div className="p-8"><Skeleton className="h-32" /></div>
  if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-xl hover:bg-cream-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 flex items-center gap-3">
            Order #{order.id.slice(0, 8).toUpperCase()}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-charcoal-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" /> Items
              </h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-cream-100 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.variant && `${item.variant.label}: ${item.variant.value}`}
                      {item.variant && ' • '}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium text-charcoal-900">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" /> Update Status
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={order.status}
                onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                className="input-base max-w-xs"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 mb-4">Summary</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-charcoal-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-charcoal-900">{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium text-charcoal-900">{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-terracotta-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-cream-200 flex justify-between font-semibold text-lg text-charcoal-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400" /> Shipping
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-charcoal-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-gray-400" /> Customer
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.userEmail}</p>
              <p className="font-mono text-xs text-gray-400 mt-2">ID: {order.userId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
