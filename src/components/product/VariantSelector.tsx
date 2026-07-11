import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'

interface VariantSelectorProps {
  variants:  ProductVariant[]
  selected?: string
  onSelect:  (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selected, onSelect }: VariantSelectorProps) {
  const types = [...new Set(variants.map(v => v.type))]

  return (
    <div className="space-y-4">
      {types.map(type => {
        const group = variants.filter(v => v.type === type)
        return (
          <div key={type}>
            <p className="text-sm font-medium text-charcoal-800 mb-2 capitalize">{type}:</p>
            <div className="flex flex-wrap gap-2">
              {group.map(variant => {
                const isSelected  = selected === variant.id
                const isOutOfStock = variant.stock === 0
                return type === 'color' ? (
                  <button
                    key={variant.id}
                    onClick={() => !isOutOfStock && onSelect(variant)}
                    disabled={isOutOfStock}
                    title={variant.label}
                    aria-label={`${variant.label} color${isOutOfStock ? ' (out of stock)' : ''}`}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all duration-150',
                      isSelected ? 'border-terracotta-500 scale-110 ring-2 ring-terracotta-200' : 'border-cream-300',
                      isOutOfStock && 'opacity-40 cursor-not-allowed',
                    )}
                    style={{ backgroundColor: variant.value }}
                  />
                ) : (
                  <button
                    key={variant.id}
                    onClick={() => !isOutOfStock && onSelect(variant)}
                    disabled={isOutOfStock}
                    aria-label={`Size ${variant.label}${isOutOfStock ? ' (out of stock)' : ''}`}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150',
                      isSelected
                        ? 'bg-terracotta-500 text-white border-terracotta-500'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-terracotta-300',
                      isOutOfStock && 'opacity-40 cursor-not-allowed line-through',
                    )}
                  >
                    {variant.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
