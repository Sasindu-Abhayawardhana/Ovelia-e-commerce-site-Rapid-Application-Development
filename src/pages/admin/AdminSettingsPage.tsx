import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const schema = z.object({
  taxPercentage: z.number().min(0).max(100),
  standardShippingRate: z.number().min(0),
  expressShippingRate: z.number().min(0),
})
type FormData = z.infer<typeof schema>

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taxPercentage: 8.5,
      standardShippingRate: 5.99,
      expressShippingRate: 15.0,
    }
  })

  useEffect(() => {
    getDoc(doc(db, 'settings', 'store')).then(snap => {
      if (snap.exists()) {
        reset(snap.data() as FormData)
      }
    }).finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'store'), data)
      toast.success('Settings saved successfully.')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Store Settings</h1>
        <p className="text-gray-500">Manage global store configurations</p>
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-64" /></div>
      ) : (
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="font-semibold text-charcoal-900 mb-4">Tax Configuration</h2>
              <Input 
                label="Sales Tax Percentage (%)" 
                type="number" 
                step="0.1" 
                {...register('taxPercentage', { valueAsNumber: true })} 
                error={errors.taxPercentage?.message} 
              />
            </div>
            
            <div className="pt-4 border-t border-cream-200">
              <h2 className="font-semibold text-charcoal-900 mb-4">Shipping Rates</h2>
              <div className="space-y-4">
                <Input 
                  label="Standard Shipping Rate ($)" 
                  type="number" 
                  step="0.01" 
                  {...register('standardShippingRate', { valueAsNumber: true })} 
                  error={errors.standardShippingRate?.message} 
                />
                <Input 
                  label="Express Shipping Rate ($)" 
                  type="number" 
                  step="0.01" 
                  {...register('expressShippingRate', { valueAsNumber: true })} 
                  error={errors.expressShippingRate?.message} 
                />
              </div>
            </div>

            <Button type="submit" loading={saving} className="w-full">
              Save Settings
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
