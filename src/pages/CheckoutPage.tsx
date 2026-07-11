import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Truck, CreditCard, Lock } from 'lucide-react'
import { httpsCallable } from 'firebase/functions'
import { doc, getDoc } from 'firebase/firestore'
import { functions, db } from '@/lib/firebase'
import { useCartStore }  from '@/store/cartStore'
import { useAuthStore }  from '@/store/authStore'
import { Input }         from '@/components/ui/Input'
import { Button }        from '@/components/ui/Button'
import { CartSummary }   from '@/components/cart/CartSummary'
import { PromoCodeInput } from '@/components/cart/PromoCodeInput'
import toast from 'react-hot-toast'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  line1:    z.string().min(5, 'Street address required'),
  line2:    z.string().optional(),
  city:     z.string().min(2, 'City required'),
  state:    z.string().min(2, 'State required'),
  zip:      z.string().min(4, 'ZIP code required'),
  country:  z.string().min(2, 'Country required'),
})

type AddressForm = z.infer<typeof addressSchema>

const DEFAULT_SHIPPING = [
  { id: 'standard', name: 'Standard Shipping',  description: '5–7 business days',  price: 5.99,  estimatedDays: '5–7 days' },
  { id: 'express',  name: 'Express Shipping',   description: '2–3 business days',  price: 15.00, estimatedDays: '2–3 days' },
]

const STEPS = ['Address', 'Shipping', 'Payment']

export function CheckoutPage() {
  const navigate    = useNavigate()
  const user        = useAuthStore(s => s.user)
  const items       = useCartStore(s => s.items)
  const total       = useCartStore(s => s.total())
  const subtotal    = useCartStore(s => s.subtotal())
  const discount    = useCartStore(s => s.discount())
  const tax         = useCartStore(s => s.tax())
  const promoCode   = useCartStore(s => s.promoCode)
  const clearCart   = useCartStore(s => s.clearCart)

  const [step,           setStep]           = useState(0)
  const [shippingMethod, setShippingMethod] = useState(DEFAULT_SHIPPING[0])
  const [processing,     setProcessing]     = useState(false)
  const [savedAddress,   setSavedAddress]   = useState<AddressForm | null>(null)
  const [settings,       setSettings]       = useState<{ taxPercentage: number, standardShippingRate: number, expressShippingRate: number } | null>(null)
  const [shippingMethods, setShippingMethods] = useState(DEFAULT_SHIPPING)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'store')).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as any
        setSettings(data)
        const newMethods = [
          { ...DEFAULT_SHIPPING[0], price: data.standardShippingRate ?? 5.99 },
          { ...DEFAULT_SHIPPING[1], price: data.expressShippingRate ?? 15.00 }
        ]
        setShippingMethods(newMethods)
        setShippingMethod(newMethods[0])
      }
    })
  }, [])

  const calcTax = () => {
    if (!settings) return tax
    const tSub = Math.max(0, subtotal - discount)
    return Math.round(tSub * (settings.taxPercentage / 100) * 100) / 100
  }

  const finalTax = calcTax()
  const finalTotal = Math.max(0, subtotal - discount + finalTax + shippingMethod.price)

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: 'United States' },
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const onAddressSubmit = (data: AddressForm) => {
    setSavedAddress(data)
    setStep(1)
    window.scrollTo({ top: 0 })
  }

  const onShippingNext = () => {
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  const onPayment = async () => {
    if (!user || !savedAddress) return
    setProcessing(true)
    try {
      const createSession = httpsCallable(functions, 'createCheckoutSession')
      const result = await createSession({
        items,
        shippingAddress: savedAddress,
        shippingMethod,
        promoCode: promoCode?.code,
        userId: user.uid,
      }) as { data: { url: string } }

      if (result.data?.url) {
        window.location.href = result.data.url
      } else {
        toast.error('Failed to start checkout. Please try again.')
      }
    } catch (err: any) {
      // If Cloud Functions not configured, simulate for demo
      toast.error('Payment service not configured. Please set up Firebase Cloud Functions and Stripe.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-2">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i <= step ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= step ? 'text-charcoal-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-cream-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Steps */}
        <div className="lg:col-span-2">

          {/* Step 0: Address */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-terracotta-500" />
                <h2 className="font-serif text-xl font-semibold">Shipping Address</h2>
              </div>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
                <Input label="Street Address" {...register('line1')} error={errors.line1?.message} />
                <Input label="Apartment, suite, etc. (optional)" {...register('line2')} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City"  {...register('city')}  error={errors.city?.message} />
                  <Input label="State" {...register('state')} error={errors.state?.message} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="ZIP Code" {...register('zip')}     error={errors.zip?.message} />
                  <Input label="Country"  {...register('country')} error={errors.country?.message} />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg">Continue to Shipping</Button>
              </form>
            </motion.div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-terracotta-500" />
                <h2 className="font-serif text-xl font-semibold">Shipping Method</h2>
              </div>
              <div className="space-y-3 mb-6">
                {shippingMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      shippingMethod.id === method.id
                        ? 'border-terracotta-400 bg-terracotta-50'
                        : 'border-cream-200 hover:border-terracotta-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod.id === method.id}
                      onChange={() => setShippingMethod(method)}
                      className="accent-terracotta-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-charcoal-900">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <span className="font-semibold text-charcoal-900">${method.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={onShippingNext}>Continue to Payment</Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-terracotta-500" />
                <h2 className="font-serif text-xl font-semibold">Payment</h2>
              </div>

              {/* Address review */}
              {savedAddress && (
                <div className="bg-cream-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
                  <p className="font-medium text-charcoal-900 mb-1">Shipping to:</p>
                  <p>{savedAddress.fullName}</p>
                  <p>{savedAddress.line1}{savedAddress.line2 ? `, ${savedAddress.line2}` : ''}</p>
                  <p>{savedAddress.city}, {savedAddress.state} {savedAddress.zip}</p>
                  <p>{savedAddress.country}</p>
                  <button onClick={() => setStep(0)} className="text-terracotta-500 hover:underline mt-2 text-xs">Edit address</button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                <p className="font-medium mb-1">🔒 Secure Checkout via Stripe</p>
                <p>You'll be redirected to Stripe's secure payment page. Test card: <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code></p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1"
                  loading={processing}
                  icon={<Lock className="w-4 h-4" />}
                  onClick={onPayment}
                >
                  Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalTotal)}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-serif text-lg font-semibold text-charcoal-900 mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 pb-4 border-b border-cream-200">
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <img src={item.image || 'https://placehold.co/48x48/F9F3EB/C17F5A?text=A'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <PromoCodeInput />
            <div className="mt-4">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
