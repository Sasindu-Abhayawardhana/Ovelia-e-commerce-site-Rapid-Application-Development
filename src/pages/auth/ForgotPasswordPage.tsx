import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const resetPassword = useAuthStore(s => s.resetPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      toast.error('Failed to send reset email. Please check the address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-terracotta-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900 mb-3">Check your email</h1>
            <p className="text-gray-500 mb-6">
              We've sent a password reset link to <strong>{email}</strong>.<br />
              Check your inbox and follow the instructions.
            </p>
            <Link to="/login"><Button variant="secondary" className="w-full">Back to Sign In</Button></Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900 mb-2">Forgot password?</h1>
            <p className="text-gray-500 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
