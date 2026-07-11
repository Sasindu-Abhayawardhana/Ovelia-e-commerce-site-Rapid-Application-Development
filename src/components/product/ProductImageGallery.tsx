import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  name:   string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [active, setActive]       = useState(0)
  const [zoomed, setZoomed]       = useState(false)
  const [zoomPos, setZoomPos]     = useState({ x: 50, y: 50 })
  const safeImages = images.length ? images : ['https://placehold.co/800x800/F9F3EB/C17F5A?text=Ovelia']

  const prev = () => setActive(i => (i - 1 + safeImages.length) % safeImages.length)
  const next = () => setActive(i => (i + 1) % safeImages.length)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-2xl bg-cream-100 aspect-square cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={safeImages[active]}
            alt={`${name} — image ${active + 1}`}
            className="w-full h-full object-cover"
            style={
              zoomed
                ? {
                    transform:      `scale(1.8)`,
                    transformOrigin:`${zoomPos.x}% ${zoomPos.y}%`,
                    transition:     'transform-origin 0.05s',
                  }
                : { transform: 'scale(1)', transition: 'transform 0.3s' }
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-charcoal-800" />
          </div>
        )}

        {/* Nav arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === active
                  ? 'border-terracotta-400 ring-2 ring-terracotta-200'
                  : 'border-cream-200 hover:border-terracotta-200',
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
