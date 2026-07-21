'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: { url: string; alt_text: string | null }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-paper-muted text-ink-muted">
        <ImageOff className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-paper-muted">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={active.url}
              alt={active.alt_text || productName}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible"
          role="tablist"
          aria-label="Images du produit"
        >
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 sm:w-auto',
                index === activeIndex
                  ? 'border-accent'
                  : 'border-transparent opacity-70 hover:border-border hover:opacity-100'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt_text || `${productName} — vue ${index + 1}`}
                fill
                sizes="10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
