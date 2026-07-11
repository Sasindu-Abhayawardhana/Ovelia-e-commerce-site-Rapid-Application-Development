import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Zap, Share2, ChevronRight } from 'lucide-react'
import { useProduct }          from '@/hooks/useProduct'
import { useReviews }          from '@/hooks/useReviews'
import { getRelatedProducts }  from '@/lib/firestore'
import { useCartStore }        from '@/store/cartStore'
import { useWishlistStore }    from '@/store/wishlistStore'
import { useAuthStore }        from '@/store/authStore'
import { useUIStore }          from '@/store/uiStore'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { VariantSelector }     from '@/components/product/VariantSelector'
import { ReviewCard }          from '@/components/product/ReviewCard'
import { ReviewForm }          from '@/components/product/ReviewForm'
import { ProductCard }         from '@/components/product/ProductCard'
import { StarRating }          from '@/components/ui/StarRating'
import { Badge }               from '@/components/ui/Badge'
import { Button }              from '@/components/ui/Button'
import { Skeleton }            from '@/components/ui/Skeleton'
import { formatCurrency }      from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'
import toast from 'react-hot-toast'

export function ProductDetailPage() {
  const { slug }     = useParams<{ slug: string }>()
  const { product, loading, error } = useProduct(slug ?? '')
  const { reviews, loading: revLoading, submitReview } = useReviews(product?.id ?? '')

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity]               = useState(1)
  const [related,  setRelated]               = useState<Product[]>([])
  const [tab, setTab]                         = useState<'description' | 'reviews'>('description')

  const user       = useAuthStore(s => s.user)
  const profile    = useAuthStore(s => s.profile)
  const addItem    = useCartStore(s => s.addItem)
  const openCart   = useUIStore(s => s.openCartDrawer)
  const isInWish   = useWishlistStore(s => s.isInWishlist)
  const addWish    = useWishlistStore(s => s.addItem)
  const remWish    = useWishlistStore(s => s.removeItem)

  useEffect(() => {
    if (product) {
      getRelatedProducts(product.category, product.id).then(setRelated)
    }
  }, [product?.id])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="text-center py-24">
      <h2 className="font-serif text-3xl text-charcoal-900 mb-4">Product not found</h2>
      <Link to="/shop" className="text-terracotta-500 hover:underline">← Back to shop</Link>
    </div>
  )

  const inWishlist     = isInWish(product.id)
  const isOutOfStock   = product.stock === 0
  const discounted     = product.compareAtPrice && product.compareAtPrice > product.price
  const effectivePrice = selectedVariant ? product.price : product.price

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      price:     effectivePrice,
      name:      product.name,
      image:     product.images[0] ?? '',
      slug:      product.slug,
      variant:   selectedVariant
        ? { type: selectedVariant.type, label: selectedVariant.label, value: selectedVariant.value }
        : undefined,
    })
    toast.success(`"${product.name}" added to cart!`, { icon: '🛍️' })
    openCart()
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Navigate to checkout handled by CartDrawer checkout button
  }

  const handleWishlist = () => {
    if (inWishlist) { remWish(product.id); toast('Removed from wishlist', { icon: '💔' }) }
    else { addWish(product.id); toast.success('Added to wishlist!', { icon: '❤️' }) }
  }

  const handleReviewSubmit = async (data: any) => {
    if (!user || !profile) { toast.error('Please sign in to leave a review.'); return false }
    const success = await submitReview({
      productId: product.id,
      userId:    user.uid,
      userName:  profile.displayName,
      userPhoto: profile.photoURL,
      rating:    data.rating,
      title:     data.title,
      comment:   data.comment,
      verified:  false,
    })
    if (success) toast.success('Review submitted!')
    else toast.error('Failed to submit review.')
    return success
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-terracotta-500">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-terracotta-500">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-terracotta-500">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">

        {/* Gallery */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <p className="text-sm font-medium text-terracotta-500 uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal-900 leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-400">
                {product.rating.toFixed(1)} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="font-serif text-3xl font-bold text-charcoal-900">
              {formatCurrency(effectivePrice)}
            </span>
            {discounted && (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice!)}
              </span>
            )}
            {discounted && (
              <Badge variant="red">
                Save {Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
              </Badge>
            )}
          </div>

          {/* Stock */}
          <div>
            {isOutOfStock ? (
              <Badge variant="gray">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="yellow">Only {product.stock} left in stock!</Badge>
            ) : (
              <Badge variant="green">In Stock</Badge>
            )}
          </div>

          {/* Short description */}
          <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant?.id}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-charcoal-800 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              icon={<Zap className="w-4 h-4" />}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </Button>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-xl border transition-colors ${
                inWishlist
                  ? 'border-terracotta-400 bg-terracotta-50 text-terracotta-500'
                  : 'border-cream-300 hover:border-terracotta-300 text-gray-400 hover:text-terracotta-400'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-cream-100 text-gray-500 text-xs rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mb-16">
        <div className="flex border-b border-cream-200 mb-8">
          {(['description', 'reviews'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-terracotta-500 text-terracotta-600'
                  : 'border-transparent text-gray-500 hover:text-charcoal-800'
              }`}
            >
              {t} {t === 'reviews' ? `(${reviews.length})` : ''}
            </button>
          ))}
        </div>

        {tab === 'description' ? (
          <div className="prose prose-sm max-w-3xl text-gray-600 leading-relaxed">
            <p>{product.description}</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Average rating */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-cream-50 rounded-2xl">
              <div className="text-center">
                <p className="font-serif text-5xl font-bold text-charcoal-900">{product.rating.toFixed(1)}</p>
                <StarRating rating={product.rating} size="sm" className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">{product.reviewCount} reviews</p>
              </div>
            </div>

            {/* Review list */}
            {revLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : (
              <div className="mb-10">
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}

            {/* Review form */}
            {user ? (
              <div className="border-t border-cream-200 pt-8">
                <h3 className="font-serif text-xl font-semibold text-charcoal-900 mb-4">Write a Review</h3>
                <ReviewForm onSubmit={handleReviewSubmit} />
              </div>
            ) : (
              <div className="border-t border-cream-200 pt-8 text-center">
                <p className="text-gray-500 mb-4">
                  <Link to="/login" className="text-terracotta-500 hover:underline">Sign in</Link> to write a review.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
