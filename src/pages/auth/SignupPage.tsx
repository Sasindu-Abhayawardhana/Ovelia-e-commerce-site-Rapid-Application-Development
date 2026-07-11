import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email:       z.string().email('Invalid email address'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  confirm:     z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const signUp   = useAuthStore(s => s.signUp)
  const loading  = useAuthStore(s => s.loading)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, data.displayName)
      toast.success('Account created! Welcome to Ovelia 🎉')
      navigate('/')
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') toast.error('This email is already registered.')
      else toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-charcoal-800 to-charcoal-900 items-center justify-center p-12">
        <div className="text-white max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-terracotta-500 rounded-xl flex items-center justify-center">
              <span className="font-serif font-bold text-lg">A</span>
            </div>
            <span className="font-serif text-3xl font-semibold">Ovelia</span>
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4 leading-tight">
            Join the Ovelia community.
          </h2>
          <p className="text-gray-400 text-lg">
            Create an account to save your wishlist, track orders, and enjoy member-exclusive offers.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal-900 mb-2">Create account</h1>
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-terracotta-500 hover:underline font-medium">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              leftIcon={<User className="w-4 h-4" />}
              {...register('displayName')}
              error={errors.displayName?.message}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('confirm')}
              error={errors.confirm?.message}
            />
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-terracotta-500 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-terracotta-500 hover:underline">Privacy Policy</a>.
            </p>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
