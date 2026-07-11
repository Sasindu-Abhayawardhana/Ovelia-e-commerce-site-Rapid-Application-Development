import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating:    number
  maxStars?: number
  size?:     'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?:   (rating: number) => void
  className?: string
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const half   = !filled && i < rating
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate?.(i + 1)}
            className={cn(
              'text-terracotta-400 transition-transform duration-100',
              interactive && 'hover:scale-110 cursor-pointer',
              !interactive && 'cursor-default',
            )}
            tabIndex={interactive ? 0 : -1}
            aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled ? 'fill-terracotta-400 text-terracotta-400' : 'fill-none text-cream-300',
                half   ? 'fill-terracotta-200 text-terracotta-300' : '',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
