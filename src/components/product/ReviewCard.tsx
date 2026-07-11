import { formatDate } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import type { Review } from '@/types'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-5 border-b border-cream-200 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0">
          {review.userPhoto ? (
            <img src={review.userPhoto} alt={review.userName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-terracotta-600 font-semibold text-sm">
              {review.userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-charcoal-900">{review.userName}</span>
            {review.verified && <Badge variant="green">Verified Purchase</Badge>}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
          {review.title && (
            <p className="font-medium text-charcoal-800 mb-1">{review.title}</p>
          )}
          <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  )
}
