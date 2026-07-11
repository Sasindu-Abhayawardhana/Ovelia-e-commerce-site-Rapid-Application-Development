import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ProductFilters } from '@/types'

const CATEGORIES = [
  { value: 'Home & Living',  label: 'Home & Living' },
  { value: 'Apparel',        label: 'Apparel' },
  { value: 'Accessories',    label: 'Accessories' },
  { value: 'Stationery',     label: 'Stationery' },
]

const PRICE_RANGES = [
  { label: 'Under $25',    min: 0,   max: 25 },
  { label: '$25 – $50',    min: 25,  max: 50 },
  { label: '$50 – $100',   min: 50,  max: 100 },
  { label: '$100 – $200',  min: 100, max: 200 },
  { label: 'Over $200',    min: 200, max: undefined },
]

interface ProductFiltersProps {
  filters:   ProductFilters
  onChange:  (f: ProductFilters) => void
  onReset:   () => void
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-cream-200 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 font-medium text-charcoal-800 hover:text-terracotta-500 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProductFiltersPanel({ filters, onChange, onReset }: ProductFiltersProps) {
  const hasActive = filters.category || filters.minPrice !== undefined || filters.inStockOnly

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-serif text-lg font-semibold text-charcoal-900">
          <SlidersHorizontal className="w-5 h-5 text-terracotta-500" />
          Filters
        </div>
        {hasActive && (
          <button
            onClick={onReset}
            className="text-sm text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={filters.category === cat.value}
                onChange={() => onChange({ ...filters, category: cat.value })}
                className="accent-terracotta-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-charcoal-900 transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
          {filters.category && (
            <button
              onClick={() => onChange({ ...filters, category: undefined })}
              className="text-xs text-terracotta-500 hover:underline mt-1"
            >
              Show all
            </button>
          )}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map(range => {
            const active = filters.minPrice === range.min && filters.maxPrice === range.max
            return (
              <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={active}
                  onChange={() => onChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
                  className="accent-terracotta-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-charcoal-900 transition-colors">
                  {range.label}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={e => onChange({ ...filters, inStockOnly: e.target.checked || undefined })}
            className="accent-terracotta-500"
          />
          <span className="text-sm text-gray-600">In stock only</span>
        </label>
      </FilterSection>
    </aside>
  )
}
