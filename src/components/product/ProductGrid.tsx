import { ProductCard } from './ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  loading:  boolean
  error?:   string | null
  columns?: 2 | 3 | 4
}

const colMap = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}

export function ProductGrid({ products, loading, error, columns = 4 }: ProductGridProps) {
  if (loading) return <ProductGridSkeleton count={8} />
  if (error)   return <div className="text-red-500 text-center py-12">{error}</div>
  if (products.length === 0) return <EmptyState type="products" />

  return (
    <div className={`grid ${colMap[columns]} gap-6`}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
