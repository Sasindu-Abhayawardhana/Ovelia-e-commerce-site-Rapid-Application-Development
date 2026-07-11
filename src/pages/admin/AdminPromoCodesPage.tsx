import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Tag, X } from 'lucide-react'
import { getAllPromoCodes, createPromoCode, updatePromoCode } from '@/lib/firestore'
import { Input }   from '@/components/ui/Input'
import { Button }  from '@/components/ui/Button'
import { Modal }   from '@/components/ui/Modal'
import { Badge }   from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PromoCode } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({
  code:         z.string().min(3).max(20).toUpperCase(),
  type:         z.enum(['percentage', 'fixed']),
  value:        z.number().positive(),
  minOrderValue:z.any(),
  maxUsage:     z.any(),
  description:  z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function AdminPromoCodesPage() {
  const [codes,   setCodes]   = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'percentage' },
  })

  const fetch = () => {
    setLoading(true)
    getAllPromoCodes().then(setCodes).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      await createPromoCode({ ...data, isActive: true, maxUsage: data.maxUsage || undefined, minOrderValue: data.minOrderValue || undefined })
      toast.success('Promo code created!')
      reset()
      setOpen(false)
      fetch()
    } catch {
      toast.error('Failed to create promo code.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (code: PromoCode) => {
    await updatePromoCode(code.id, { isActive: !code.isActive })
    toast.success(code.isActive ? 'Code deactivated' : 'Code activated')
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Promo Codes</h1>
          <p className="text-gray-500">{codes.length} codes</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
          New Code
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => (
                <tr key={code.id} className="border-b border-cream-100 hover:bg-cream-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-terracotta-400" />
                      <span className="font-mono font-semibold text-charcoal-900">{code.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{code.type}</td>
                  <td className="px-4 py-3 font-medium">
                    {code.type === 'percentage' ? `${code.value}%` : `$${code.value.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{code.minOrderValue ? `$${code.minOrderValue}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{code.usageCount}{code.maxUsage ? `/${code.maxUsage}` : ''}</td>
                  <td className="px-4 py-3">
                    <Badge variant={code.isActive ? 'green' : 'gray'}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(code)}
                      className="text-xs text-terracotta-500 hover:underline"
                    >
                      {code.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codes.length === 0 && <div className="text-center py-10 text-gray-400">No promo codes yet.</div>}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Promo Code">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Code" placeholder="SUMMER20" {...register('code')} error={errors.code?.message} />
          <div>
            <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Type</label>
            <select {...register('type')} className="input-base">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <Input label="Value" type="number" step="0.01" {...register('value', { valueAsNumber: true })} error={errors.value?.message} />
          <Input label="Minimum Order Value ($)" type="number" step="0.01" placeholder="0 = no minimum" {...register('minOrderValue', { valueAsNumber: true })} />
          <Input label="Max Usage (optional)" type="number" placeholder="Leave blank for unlimited" {...register('maxUsage', { valueAsNumber: true })} />
          <Input label="Description (optional)" {...register('description')} />
          <Button type="submit" className="w-full" loading={saving}>Create Code</Button>
        </form>
      </Modal>
    </div>
  )
}
