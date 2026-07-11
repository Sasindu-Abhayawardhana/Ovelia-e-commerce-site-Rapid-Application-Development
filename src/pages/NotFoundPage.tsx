import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.p
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-8xl mb-6"
        >
          🔍
        </motion.p>
        <h1 className="font-serif text-5xl font-bold text-charcoal-900 mb-3">404</h1>
        <h2 className="font-serif text-2xl text-charcoal-800 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for has moved or doesn't exist.
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/shop" className="btn-secondary">
            <Search className="w-4 h-4" />
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
