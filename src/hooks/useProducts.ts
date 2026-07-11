import { useState, useEffect, useCallback, useRef } from 'react'
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { getProducts } from '@/lib/firestore'
import type { Product, ProductFilters, SortOption } from '@/types'

export function useProducts(filters: ProductFilters = {}, sort: SortOption = 'newest', pageSize = 12) {
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [hasMore, setHasMore]       = useState(true)
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  const fetchProducts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      lastDocRef.current = null
    } else {
      setLoadingMore(true)
    }
    setError(null)
    try {
      const { products: newProducts, lastDoc } = await getProducts(
        filters,
        sort,
        pageSize,
        reset ? undefined : lastDocRef.current ?? undefined,
      )
      lastDocRef.current = lastDoc
      setProducts(prev => reset ? newProducts : [...prev, ...newProducts])
      setHasMore(newProducts.length === pageSize)
    } catch (e) {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [JSON.stringify(filters), sort, pageSize])

  useEffect(() => {
    fetchProducts(true)
  }, [fetchProducts])

  return { products, loading, loadingMore, error, hasMore, loadMore: () => fetchProducts(false) }
}
