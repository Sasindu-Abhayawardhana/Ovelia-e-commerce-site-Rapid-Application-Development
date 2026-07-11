import { useState, useEffect } from 'react'
import { getProductBySlug } from '@/lib/firestore'
import type { Product } from '@/types'

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getProductBySlug(slug)
      .then(p => {
        setProduct(p)
        if (!p) setError('Product not found.')
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [slug])

  return { product, loading, error }
}
