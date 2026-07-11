import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown } from 'lucide-react'
import { useAdminOrders }  from '@/hooks/useAdminOrders'
import { updateOrderStatus } from '@/lib/firestore'
import { OrderStatusBadge }  from '@/components/ui/Badge'
import { Skeleton }          from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { OrderStatus }  from '@/types'
import toast from 'react-hot-toast'

const STATUSES: OrderStatus[] = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch]             = useState('')
  const { orders, loading, refetch }    = useAdminOrders(statusFilter || undefined)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success(`Order status updated to ${status}`)
      refetch()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const filtered = orders.filter(o =>
    !search || o.id.includes(search) || (o.userEmail ?? '').includes(search),
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Orders</h1>
        <p className="text-gray-500">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or email…" className="input-base pl-9" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-base pr-8 min-w-[160px]">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-mono text-xs text-terracotta-600 hover:underline">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.userEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-xs border border-cream-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta-300"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No orders found.</div>
          )}
        </div>
      )}
    </div>
  )
}
