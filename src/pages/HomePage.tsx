import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import { ProductGrid }       from '@/components/product/ProductGrid'
import { Button }            from '@/components/ui/Button'
import { getFeaturedProducts, getNewArrivals } from '@/lib/firestore'
import type { Product }      from '@/types'

const HERO_SLIDES = [
  {
    title:    'Curated for\nModern Living',
    subtitle: 'Discover thoughtfully designed pieces that bring warmth and intention to your everyday spaces.',
    cta:      'Shop Now',
    href:     '/shop',
    bg:       'from-terracotta-100 to-cream-200',
    accent:   'text-terracotta-600',
    image:    'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=900&auto=format&fit=crop',
  },
  {
    title:    'New Season\nArrivals',
    subtitle: 'Fresh styles and timeless essentials — explore what\'s new this season at Ovelia.',
    cta:      'New Arrivals',
    href:     '/shop?sort=newest',
    bg:       'from-sage-100 to-cream-100',
    accent:   'text-sage-500',
    image:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop',
  },
  {
    title:    'Gifting Made\nBeautiful',
    subtitle: 'Find the perfect gift for every occasion — curated with care, delivered with love.',
    cta:      'Shop Gifts',
    href:     '/shop',
    bg:       'from-gold-300/30 to-cream-100',
    accent:   'text-gold-500',
    image:    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&auto=format&fit=crop',
  },
]

const CATEGORIES = [
  { label: 'Home & Living', href: '/shop?category=Home+%26+Living', emoji: '🏡', desc: 'Decor, candles & more' },
  { label: 'Apparel',       href: '/shop?category=Apparel',         emoji: '👗', desc: 'Relaxed, refined style' },
  { label: 'Accessories',   href: '/shop?category=Accessories',     emoji: '👜', desc: 'Bags, jewels & more' },
  { label: 'Stationery',    href: '/shop?category=Stationery',      emoji: '✏️', desc: 'Notebooks, planners' },
]

const FEATURES = [
  { icon: Truck,       title: 'Free Shipping',      desc: 'On orders over $75' },
  { icon: Shield,      title: 'Secure Payments',    desc: 'SSL encrypted checkout' },
  { icon: RefreshCw,   title: 'Easy Returns',       desc: '30-day return policy' },
  { icon: Headphones,  title: 'Customer Support',   desc: '24/7 live chat' },
]

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item:      { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
}

export function HomePage() {
  const [slide,    setSlide]    = useState(0)
  const [featured, setFeatured] = useState<Product[]>([])
  const [arrivals, setArrivals] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([getFeaturedProducts(8), getNewArrivals(8)])
      .then(([f, a]) => { setFeatured(f); setArrivals(a) })
      .finally(() => setLoading(false))
  }, [])

  const hero = HERO_SLIDES[slide]

  return (
    <div className="overflow-x-hidden">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className={`relative min-h-[90vh] flex items-center bg-gradient-to-br ${hero.bg} transition-all duration-1000`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className={`text-sm font-semibold uppercase tracking-widest ${hero.accent} mb-4`}>
              Ovelia Collection
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal-900 leading-tight whitespace-pre-line mb-6">
              {hero.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={hero.href}>
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  {hero.cta}
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="secondary" size="lg">
                  Browse All
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            key={`img-${slide}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-lift aspect-[4/3]">
              <img
                src={hero.image}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
                <p className="text-xs text-gray-400 uppercase tracking-wider">New Season</p>
                <p className="font-serif text-lg font-semibold text-charcoal-900">2026 Collection</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-terracotta-500' : 'w-1.5 bg-cream-300'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Features Strip ───────────────────────────────────────────────── */}
      <section className="bg-charcoal-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-terracotta-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Everything you need, beautifully organized</p>
        </div>
        <motion.div
          variants={stagger.container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {CATEGORIES.map(cat => (
            <motion.div key={cat.label} variants={stagger.item}>
              <Link
                to={cat.href}
                className="group block card p-6 text-center hover:border-terracotta-200 hover:shadow-lift transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {cat.emoji}
                </div>
                <h3 className="font-serif font-semibold text-charcoal-900 mb-1 group-hover:text-terracotta-600 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-gray-400">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Featured Products ─────────────────────────────────────────────── */}
      <section className="bg-cream-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our most-loved pieces</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-1 text-terracotta-500 hover:text-terracotta-600 font-medium text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} columns={4} />
          <div className="text-center mt-10 md:hidden">
            <Link to="/shop"><Button variant="secondary">View All Products</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Banner ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-terracotta-600 to-terracotta-800 p-12 md:p-16">
          <div className="relative z-10 max-w-2xl">
            <p className="text-terracotta-200 text-sm uppercase tracking-widest font-semibold mb-3">
              Limited Time
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Free shipping on<br />orders over $75
            </h2>
            <p className="text-terracotta-100 mb-8 text-lg">
              No code needed — discount applied automatically at checkout.
            </p>
            <Link to="/shop">
              <button className="px-8 py-4 bg-white text-terracotta-700 font-semibold rounded-xl hover:bg-cream-50 transition-colors">
                Shop Now
              </button>
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-24 w-64 h-64 bg-white/5 rounded-full translate-y-1/3" />
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Just landed this season</p>
          </div>
          <Link to="/shop?sort=newest" className="hidden md:flex items-center gap-1 text-terracotta-500 hover:text-terracotta-600 font-medium text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={arrivals} loading={loading} columns={4} />
      </section>

    </div>
  )
}
