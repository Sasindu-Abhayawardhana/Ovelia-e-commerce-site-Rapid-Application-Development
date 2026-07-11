import { useState, useEffect, useCallback } from 'react'
import { getAllOrders } from '@/lib/firestore'
import type { Order } from '@/types'

export function useAdminOrders(statusFilter?: string) {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    getAllOrders(statusFilter)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { refetch() }, [refetch])

  return { orders, loading, error, refetch }
}
