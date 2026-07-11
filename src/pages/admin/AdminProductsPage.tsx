import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react'
import { getDocs } from 'firebase/firestore'
import { productsCol, deleteProduct } from '@/lib/firestore'
import { formatCurrency }             from '@/lib/utils'
import { Button }   from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge }    from '@/components/ui/Badge'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const fetchProducts = () => {
    setLoading(true)
    getDocs(productsCol)
      .then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted.')
      fetchProducts()
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Products</h1>
          <p className="text-gray-500">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              if (!confirm('Clear all existing products and add 5 sample products?')) return
              const { seedProducts } = await import('@/lib/seedData')
              const { createProduct, deleteProduct } = await import('@/lib/firestore')
              
              setLoading(true)
              for (const p of products) {
                await deleteProduct(p.id).catch(() => {})
              }
              for (const p of seedProducts) {
                await createProduct(p as any)
              }
              toast.success('Store reset with sample products!')
              fetchProducts()
            }}
          >
            Seed Demo Data
          </Button>
          <Link to="/admin/products/new">
            <Button icon={<Plus className="w-4 h-4" />}>Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input-base pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-cream-100 hover:bg-cream-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] ?? 'https://placehold.co/40x40/F9F3EB/C17F5A?text=A'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-charcoal-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-green-600'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.stock === 0
                      ? <Badge variant="red">Out of Stock</Badge>
                      : product.featured
                        ? <Badge variant="terracotta">Featured</Badge>
                        : <Badge variant="green">Active</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${product.id}/edit`}>
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" aria-label="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>No products found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
