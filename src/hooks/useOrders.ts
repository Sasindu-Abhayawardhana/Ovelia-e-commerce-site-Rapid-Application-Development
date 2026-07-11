import { useState, useEffect } from 'react'
import { getUserOrders } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import type { Order } from '@/types'

export function useOrders() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return }
    setLoading(true)
    getUserOrders(user.uid)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [user, user?.uid])

  return { orders, loading, error }
}
