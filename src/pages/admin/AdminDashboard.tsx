import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { getAllOrders, getAllUsers, productsCol } from '@/lib/firestore'
import { getDocs, where, query, limit } from 'firebase/firestore'
import { formatCurrency } from '@/lib/utils'
import type { Order } from '@/types'

const generateSalesData = (orders: Order[]) => {
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  return last30.map(date => {
    const dayOrders = orders.filter(o => {
      const d = o.createdAt?.toDate?.() ?? new Date(0)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date
    })
    return {
      date,
      revenue: dayOrders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0),
      orders:  dayOrders.length,
    }
  })
}

const getTopProducts = (orders: Order[]) => {
  const productCounts: Record<string, { name: string, quantity: number }> = {}
  
  orders.forEach(order => {
    if (order.status !== 'Cancelled') {
      order.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.name, quantity: 0 }
        }
        productCounts[item.productId].quantity += item.quantity
      })
    }
  })

  return Object.values(productCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
}

const StatCard = ({ title, value, icon: Icon, color, delta }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {delta && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">{delta}</span>}
    </div>
    <p className="text-2xl font-bold text-charcoal-900 font-serif">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </motion.div>
)

export function AdminDashboard() {
  const [orders,    setOrders]    = useState<Order[]>([])
  const [userCount, setUserCount] = useState(0)
  const [lowStock,  setLowStock]  = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getAllOrders(),
      getAllUsers(),
      getDocs(query(productsCol, where('stock', '<=', 5), limit(50))),
    ]).then(([o, u, lsSnap]) => {
      setOrders(o)
      setUserCount(u.length)
      setLowStock(lsSnap.size)
    }).finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0)
  const salesData    = generateSalesData(orders)
  const topProducts  = getTopProducts(orders)

  const stats = [
    { title: 'Total Revenue',  value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-terracotta-500' },
    { title: 'Total Orders',   value: orders.length,                icon: ShoppingBag, color: 'bg-blue-500' },
    { title: 'Customers',      value: userCount,                    icon: Users,       color: 'bg-purple-500' },
    { title: 'Low Stock Items',value: lowStock,                     icon: AlertTriangle,color: 'bg-amber-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-serif text-xl font-semibold text-charcoal-900 mb-6">Revenue (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C17F5A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C17F5A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2E8D6" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  axisLine={false} 
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={v => `$${v}`} 
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(v: any) => [`$${v.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C17F5A" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold text-charcoal-900 mb-6">Top Products</h2>
          <div className="h-64">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2E8D6" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#F9F3EB' }}
                  />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#C17F5A' : '#d1d5db'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <h2 className="font-serif text-xl font-semibold text-charcoal-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-gray-500">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(null).map((_, i) => (
                    <tr key={i} className="border-b border-cream-100">
                      <td colSpan={4} className="py-3"><div className="h-4 skeleton rounded" /></td>
                    </tr>
                  ))
                : orders.slice(0, 10).map(o => (
                    <tr key={o.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                      <td className="py-3 font-mono text-xs text-charcoal-900">#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-3 text-gray-600">{o.userEmail ?? '—'}</td>
                      <td className="py-3 font-medium">{formatCurrency(o.total)}</td>
                      <td className="py-3">
                        <span className={`badge ${
                          o.status === 'Delivered'  ? 'badge-green' :
                          o.status === 'Shipped'    ? 'badge-terracotta' :
                          o.status === 'Processing' ? 'badge-yellow' :
                          o.status === 'Cancelled'  ? 'badge-red' : 'badge-blue'
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
