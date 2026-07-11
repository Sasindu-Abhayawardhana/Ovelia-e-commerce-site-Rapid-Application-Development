import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export function PromoCodeInput() {
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const applyPromoCode  = useCartStore(s => s.applyPromoCode)
  const removePromoCode = useCartStore(s => s.removePromoCode)
  const promoCode       = useCartStore(s => s.promoCode)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    const result = await applyPromoCode(code.trim())
    if (result.success) {
      toast.success(result.message)
      setCode('')
    } else {
      toast.error(result.message)
    }
    setLoading(false)
  }

  if (promoCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">{promoCode.code} applied!</span>
        </div>
        <button
          onClick={() => { removePromoCode(); toast('Promo code removed', { icon: '🏷️' }) }}
          className="text-green-500 hover:text-green-700"
          aria-label="Remove promo code"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="PROMO CODE"
          className="input-base pl-9 uppercase text-sm tracking-wider"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="px-4 py-3 bg-charcoal-800 text-white rounded-xl text-sm font-medium hover:bg-charcoal-900 disabled:opacity-50 transition-colors"
      >
        {loading ? '…' : 'Apply'}
      </button>
    </form>
  )
}
