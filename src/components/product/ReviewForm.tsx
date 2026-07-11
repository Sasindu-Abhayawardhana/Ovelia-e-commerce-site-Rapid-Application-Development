import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StarRating } from '@/components/ui/StarRating'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  rating:  z.number().min(1, 'Please select a rating').max(5),
  title:   z.string().optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
})

type FormData = z.infer<typeof schema>

interface ReviewFormProps {
  onSubmit: (data: FormData) => Promise<boolean>
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating]         = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleRate = (r: number) => {
    setRating(r)
    setValue('rating', r, { shouldValidate: true })
  }

  const onFormSubmit = async (data: FormData) => {
    setSubmitting(true)
    const success = await onSubmit(data)
    if (success) {
      reset()
      setRating(0)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-charcoal-800 mb-2">Your Rating *</p>
        <StarRating rating={rating} interactive onRate={handleRate} size="lg" />
        {errors.rating && <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>}
        <input type="hidden" {...register('rating', { valueAsNumber: true })} />
      </div>

      <Input
        label="Review title (optional)"
        placeholder="Summarize your experience"
        {...register('title')}
        error={errors.title?.message}
      />

      <div>
        <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Your Review *</label>
        <textarea
          {...register('comment')}
          rows={4}
          placeholder="Tell others about your experience with this product…"
          className="input-base resize-none"
        />
        {errors.comment && <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>}
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        Submit Review
      </Button>
    </form>
  )
}
