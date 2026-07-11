import { useState, useEffect } from 'react'
import { getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { productsCol, getReviewsRef } from '@/lib/firestore'
import { StarRating } from '@/components/ui/StarRating'
import { Button }    from '@/components/ui/Button'
import { Skeleton }  from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import type { Product, Review } from '@/types'
import toast from 'react-hot-toast'

interface ReviewWithProduct extends Review {
  productName: string
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try {
      const productsSnap = await getDocs(productsCol)
      const all: ReviewWithProduct[] = []
      await Promise.all(
        productsSnap.docs.map(async pDoc => {
          const product = { id: pDoc.id, ...pDoc.data() } as Product
          const reviewsSnap = await getDocs(getReviewsRef(product.id))
          reviewsSnap.docs.forEach(rDoc => {
            all.push({ id: rDoc.id, ...rDoc.data(), productName: product.name } as ReviewWithProduct)
          })
        }),
      )
      all.sort((a, b) => (b.createdAt?.toDate?.() ?? 0) > (a.createdAt?.toDate?.() ?? 0) ? 1 : -1)
      setReviews(all)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteDoc(doc(db, 'products', productId, 'reviews', reviewId))
      toast.success('Review deleted.')
      fetch()
    } catch {
      toast.error('Failed to delete review.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Reviews</h1>
        <p className="text-gray-500">{reviews.length} total reviews</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="card p-5 flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-charcoal-900">{review.userName}</p>
                    <p className="text-xs text-gray-400">on <span className="text-terracotta-500">{review.productName}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    <button
                      onClick={() => handleDelete(review.productId, review.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" className="mb-2" />
                {review.title && <p className="font-medium text-sm text-charcoal-800 mb-1">{review.title}</p>}
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <div className="text-center py-12 text-gray-400">No reviews yet.</div>}
        </div>
      )}
    </div>
  )
}
