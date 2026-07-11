import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUIStore } from '@/store/uiStore'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered]   = useState(false)

  const addItem        = useCartStore(s => s.addItem)
  const isInWishlist   = useWishlistStore(s => s.isInWishlist)
  const toggleWishlist = useWishlistStore(s => s.addItem)
  const removeWishlist = useWishlistStore(s => s.removeItem)
  const openCart       = useUIStore(s => s.openCartDrawer)

  const inWishlist   = isInWishlist(product.id)
  const discounted   = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPct  = discounted
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      quantity:  1,
      price:     product.price,
      name:      product.name,
      image:     product.images[0] ?? '',
      slug:      product.slug,
    })
    toast.success(`"${product.name}" added to cart!`, { icon: '🛍️' })
    openCart()
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (inWishlist) {
      removeWishlist(product.id)
      toast('Removed from wishlist', { icon: '💔' })
    } else {
      toggleWishlist(product.id)
      toast.success('Added to wishlist!', { icon: '❤️' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn('product-card group', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/shop/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-cream-100">
          <img
            src={imgError ? 'https://placehold.co/400x400/F9F3EB/C17F5A?text=Ovelia' : (product.images[0] ?? '')}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.newArrival && <Badge variant="terracotta">New</Badge>}
            {discounted && <Badge variant="red">-{discountPct}%</Badge>}
            {product.stock === 0 && <Badge variant="gray">Sold Out</Badge>}
          </div>

          {/* Action overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/10 flex items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className={cn(
                'p-2.5 rounded-full shadow-md transition-colors',
                inWishlist ? 'bg-terracotta-500 text-white' : 'bg-white text-charcoal-800 hover:bg-terracotta-50',
              )}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
            </motion.button>

            {product.stock > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="p-2.5 bg-terracotta-500 text-white rounded-full shadow-md hover:bg-terracotta-600 transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            )}

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to={`/shop/${product.slug}`}
                className="p-2.5 bg-white text-charcoal-800 rounded-full shadow-md hover:bg-cream-50 transition-colors block"
                aria-label="View product"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-terracotta-500 font-medium uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-serif font-medium text-charcoal-900 leading-snug mb-2 line-clamp-2 group-hover:text-terracotta-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.rating} size="sm" />
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-900">{formatCurrency(product.price)}</span>
              {discounted && (
                <span className="text-sm text-gray-400 line-through">{formatCurrency(product.compareAtPrice!)}</span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-amber-600 font-medium">Only {product.stock} left</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
