import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as any)?.from?.pathname ?? '/'

  const signIn           = useAuthStore(s => s.signIn)
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle)
  const loading          = useAuthStore(s => s.loading)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const isAdmin = await signIn(data.email, data.password)
      toast.success('Welcome back!')
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      toast.error(err.message?.includes('wrong-password') ? 'Incorrect email or password.' : 'Sign in failed. Please try again.')
    }
  }

  const handleGoogle = async () => {
    try {
      const isAdmin = await signInWithGoogle()
      toast.success('Signed in with Google!')
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      console.error('Google auth error:', err)
      toast.error('Google sign-in failed: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-terracotta-500 to-terracotta-800 items-center justify-center p-12">
        <div className="text-white max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-serif font-bold text-lg">A</span>
            </div>
            <span className="font-serif text-3xl font-semibold">Ovelia</span>
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4 leading-tight">
            Welcome back to your curated world.
          </h2>
          <p className="text-terracotta-100 text-lg">
            Sign in to access your orders, wishlist, and exclusive member offers.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal-900 mb-2">Sign in</h1>
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-terracotta-500 hover:underline font-medium">Create one</Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-cream-300 rounded-xl hover:bg-cream-50 transition-colors mb-5 font-medium text-charcoal-800"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream-300" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-cream-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-terracotta-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
