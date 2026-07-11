import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGrid }          from '@/components/product/ProductGrid'
import { ProductFiltersPanel }  from '@/components/product/ProductFilters'
import { Button }               from '@/components/ui/Button'
import { useProducts }          from '@/hooks/useProducts'
import { useDebounce }          from '@/hooks/useDebounce'
import { searchProducts }       from '@/lib/firestore'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import type { ProductFilters, SortOption, Product } from '@/types'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest',       value: 'newest' },
  { label: 'Price: Low',   value: 'price-asc' },
  { label: 'Price: High',  value: 'price-desc' },
  { label: 'Top Rated',    value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
]

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const initCategory   = searchParams.get('category') ?? undefined
  const initSearch     = searchParams.get('search') ?? ''
  const initSort       = (searchParams.get('sort') ?? 'newest') as SortOption

  const [filters,       setFilters]       = useState<ProductFilters>({ category: initCategory })
  const [sort,          setSort]          = useState<SortOption>(initSort)
  const [searchTerm,    setSearchTerm]    = useState(initSearch)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [searching,     setSearching]     = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 400)

  const { products, loading, loadingMore, hasMore, loadMore } = useProducts(filters, sort)

  // Perform full-text search
  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults(null); return }
    setSearching(true)
    searchProducts(debouncedSearch)
      .then(setSearchResults)
      .finally(() => setSearching(false))
  }, [debouncedSearch])

  const displayProducts = searchResults ?? products
  const isSearching     = !!searchTerm.trim()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-2">
          {filters.category ?? 'All Products'}
        </h1>
        <p className="text-gray-500">
          {isSearching
            ? `Showing results for "${searchTerm}"`
            : `Discover our full collection`}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products…"
            className="input-base pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSearchResults(null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="input-base appearance-none pr-8 min-w-[160px] cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Mobile filter button */}
        <Button
          variant="secondary"
          size="sm"
          className="sm:hidden"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={() => setMobileFilters(true)}
        >
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFiltersPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg font-semibold">Filters</h3>
                <button onClick={() => setMobileFilters(false)} className="p-2 hover:bg-cream-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ProductFiltersPanel
                filters={filters}
                onChange={f => { setFilters(f); setMobileFilters(false) }}
                onReset={() => { setFilters({}); setMobileFilters(false) }}
              />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid
            products={displayProducts}
            loading={loading || searching}
            columns={3}
          />

          {!isSearching && hasMore && !loading && (
            <div className="mt-10 text-center">
              <Button
                variant="secondary"
                loading={loadingMore}
                onClick={loadMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
