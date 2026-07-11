import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore }     from '@/store/cartStore'
import { useUIStore }       from '@/store/uiStore'
import { getProductById }   from '@/lib/firestore'
import { EmptyState }       from '@/components/ui/EmptyState'
import { Button }           from '@/components/ui/Button'
import { formatCurrency }   from '@/lib/utils'
import type { Product }     from '@/types'
import toast from 'react-hot-toast'

export function WishlistPage() {
  const items       = useWishlistStore(s => s.items)
  const removeItem  = useWishlistStore(s => s.removeItem)
  const addToCart   = useCartStore(s => s.addItem)
  const openCart    = useUIStore(s => s.openCartDrawer)

  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return }
    Promise.all(items.map(i => getProductById(i.productId)))
      .then(ps => {
        const map: Record<string, Product> = {}
        ps.forEach(p => { if (p) map[p.id] = p })
        setProducts(map)
      })
      .finally(() => setLoading(false))
  }, [items.length])

  const handleMoveToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      quantity:  1,
      price:     product.price,
      name:      product.name,
      image:     product.images[0] ?? '',
      slug:      product.slug,
    })
    removeItem(product.id)
    toast.success('Moved to cart!', { icon: '🛍️' })
    openCart()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-terracotta-500 fill-current" />
        <h1 className="font-serif text-4xl font-bold text-charcoal-900">Wishlist</h1>
        <span className="badge-gray">({items.length})</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card h-64 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          type="wishlist"
          action={
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map(item => {
            const product = products[item.productId]
            if (!product) return null
            return (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card overflow-hidden group"
              >
                <Link to={`/shop/${product.slug}`}>
                  <div className="aspect-square overflow-hidden bg-cream-100">
                    <img
                      src={product.images[0] ?? 'https://placehold.co/300x300/F9F3EB/C17F5A?text=A'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-terracotta-500 uppercase tracking-wider mb-1">{product.category}</p>
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="font-serif font-medium text-charcoal-900 line-clamp-2 mb-2 hover:text-terracotta-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-semibold text-charcoal-900 mb-3">{formatCurrency(product.price)}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      icon={<ShoppingCart className="w-3.5 h-3.5" />}
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Move to Cart
                    </Button>
                    <button
                      onClick={() => { removeItem(product.id); toast('Removed', { icon: '💔' }) }}
                      className="p-2 rounded-xl border border-cream-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
