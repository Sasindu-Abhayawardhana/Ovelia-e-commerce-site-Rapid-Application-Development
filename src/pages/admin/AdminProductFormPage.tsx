import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, X, Plus } from 'lucide-react'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage }         from '@/lib/firebase'
import { createProduct, updateProduct, getProductById } from '@/lib/firestore'
import { slugify }         from '@/lib/utils'
import { Input }           from '@/components/ui/Input'
import { Button }          from '@/components/ui/Button'
import type { ProductVariant } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({
  name:             z.string().min(2, 'Name required'),
  shortDescription: z.string().min(10, 'Short description required').max(200),
  description:      z.string().min(20, 'Description required'),
  price:            z.number().positive('Price must be positive'),
  compareAtPrice:   z.number().optional(),
  stock:            z.number().int().min(0),
  category:         z.string().min(2, 'Category required'),
  subcategory:      z.string().optional(),
  tags:             z.string(),
  featured:         z.boolean(),
  newArrival:       z.boolean(),
})
type FormData = z.infer<typeof schema>

const CATEGORIES = ['Home & Living', 'Apparel', 'Accessories', 'Stationery']

export function AdminProductFormPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const isEdit     = id !== 'new' && !!id
  const [images,   setImages]   = useState<string[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(isEdit)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { featured: false, newArrival: false, stock: 0, price: 0 },
  })

  useEffect(() => {
    if (isEdit && id) {
      getProductById(id).then(p => {
        if (p) {
          reset({
            name:             p.name,
            shortDescription: p.shortDescription,
            description:      p.description,
            price:            p.price,
            compareAtPrice:   p.compareAtPrice,
            stock:            p.stock,
            category:         p.category,
            subcategory:      p.subcategory,
            tags:             p.tags.join(', '),
            featured:         p.featured,
            newArrival:       p.newArrival,
          })
          setImages(p.images)
          setVariants(p.variants || [])
        }
      }).finally(() => setLoading(false))
    }
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(async file => {
        const r = storageRef(storage, `products/${Date.now()}-${file.name}`)
        await uploadBytes(r, file)
        return getDownloadURL(r)
      }))
      setImages(prev => [...prev, ...urls])
      toast.success(`${urls.length} image(s) uploaded`)
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) { toast.error('Please upload at least one image.'); return }
    setSaving(true)
    try {
      const productData = {
        ...data,
        slug:           slugify(data.name),
        images,
        tags:           data.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants,
        rating:         0,
        reviewCount:    0,
        compareAtPrice: data.compareAtPrice || undefined,
        subcategory:    data.subcategory || undefined,
      }
      if (isEdit && id) {
        await updateProduct(id, productData)
        toast.success('Product updated!')
      } else {
        await createProduct(productData as any)
        toast.success('Product created!')
      }
      navigate('/admin/products')
    } catch {
      toast.error('Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="skeleton w-32 h-8 rounded" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl hover:bg-cream-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-900">Product Details</h2>
            <Input label="Product Name" {...register('name')} error={errors.name?.message} />
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Short Description</label>
              <textarea {...register('shortDescription')} rows={2} className="input-base resize-none" />
              {errors.shortDescription && <p className="text-sm text-red-500 mt-1">{errors.shortDescription.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Full Description</label>
              <textarea {...register('description')} rows={5} className="input-base resize-none" />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-900">Pricing & Inventory</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Price ($)" type="number" step="0.01" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
              <Input label="Compare at ($)" type="number" step="0.01" {...register('compareAtPrice', { valueAsNumber: true })} />
              <Input label="Total Stock" type="number" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
            </div>
            
            <div className="mt-6 pt-6 border-t border-cream-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal-900 text-sm">Variants (Optional)</h3>
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { id: crypto.randomUUID(), type: 'size', label: '', value: '', stock: 0 }])}
                  className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Variant
                </button>
              </div>
              
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <select
                      value={v.type}
                      onChange={(e) => {
                        const newVars = [...variants]; newVars[i].type = e.target.value as any; setVariants(newVars)
                      }}
                      className="input-base w-24 text-sm"
                    >
                      <option value="size">Size</option>
                      <option value="color">Color</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Label (e.g. Medium)"
                      value={v.label}
                      onChange={(e) => {
                        const newVars = [...variants]; newVars[i].label = e.target.value; setVariants(newVars)
                      }}
                      className="input-base flex-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. M or #000)"
                      value={v.value}
                      onChange={(e) => {
                        const newVars = [...variants]; newVars[i].value = e.target.value; setVariants(newVars)
                      }}
                      className="input-base flex-1 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) => {
                        const newVars = [...variants]; newVars[i].stock = parseInt(e.target.value) || 0; setVariants(newVars)
                      }}
                      className="input-base w-20 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {variants.length === 0 && <p className="text-sm text-gray-400">No variants added.</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-semibold text-charcoal-900 mb-4">Product Images</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-cream-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-cream-300 flex flex-col items-center justify-center cursor-pointer hover:border-terracotta-300 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">{uploading ? 'Uploading…' : 'Upload'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-900">Category & Tags</h2>
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Category</label>
              <select {...register('category')} className="input-base">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <Input label="Subcategory (optional)" {...register('subcategory')} />
            <Input label="Tags (comma separated)" placeholder="tag1, tag2, tag3" {...register('tags')} />
          </div>

          <div className="card p-6 space-y-3">
            <h2 className="font-semibold text-charcoal-900">Visibility</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="accent-terracotta-500" />
              <span className="text-sm">Featured product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('newArrival')} className="accent-terracotta-500" />
              <span className="text-sm">New arrival</span>
            </label>
          </div>

          <Button type="submit" className="w-full" loading={saving} size="lg">
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
