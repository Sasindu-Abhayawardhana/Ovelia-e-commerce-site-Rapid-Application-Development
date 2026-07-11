import { useState, useEffect } from 'react'
import { getReviews, addReview } from '@/lib/firestore'
import type { Review } from '@/types'

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = () => {
    if (!productId) return
    setLoading(true)
    getReviews(productId)
      .then(setReviews)
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [productId])

  const submitReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    setSubmitting(true)
    try {
      await addReview(productId, review)
      fetchReviews()
      return true
    } catch {
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return { reviews, loading, error, submitting, submitReview, refetch: fetchReviews }
}
