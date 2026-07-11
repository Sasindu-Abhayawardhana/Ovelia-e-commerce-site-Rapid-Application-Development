import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight } from 'lucide-react'
import { useOrders }          from '@/hooks/useOrders'
import { OrderStatusBadge }   from '@/components/ui/Badge'
import { EmptyState }         from '@/components/ui/EmptyState'
import { Skeleton }           from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function OrderHistoryPage() {
  const { orders, loading, error } = useOrders()

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  )

  if (error) return <p className="text-red-500">{error}</p>

  if (orders.length === 0) return (
    <EmptyState
      type="orders"
      action={<Link to="/shop"><Button>Start Shopping</Button></Link>}
    />
  )

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold text-charcoal-900">Order History</h2>

      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/account/orders/${order.id}`}
            className="card p-5 flex items-center justify-between group hover:shadow-lift transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-terracotta-500" />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-400">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-charcoal-900">{formatCurrency(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-terracotta-500 transition-colors" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
