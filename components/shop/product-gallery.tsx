'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: { url: string; alt_text: string | null }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const active = images[activeIndex]

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50
    const swipe = info.offset.x

    if (swipe < -swipeThreshold) {
      goToNext()
    } else if (swipe > swipeThreshold) {
      goToPrevious()
    }
    setDragX(0)
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-paper-muted text-ink-muted">
        <ImageOff className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div>
      <div 
        className="relative aspect-square overflow-hidden rounded-xl bg-paper-muted cursor-pointer"
        onClick={() => setIsLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsLightboxOpen(true)
          }
        }}
        aria-label="Cliquer pour agrandir l'image"
      >
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Fermer"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Image Container avec Swipe */}
              <motion.div
                drag={images.length > 1 ? 'x' : false}
                dragElastic={0.2}
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={(event, info) => setDragX(info.offset.x)}
                onDragEnd={handleDragEnd}
                className="relative h-full w-full max-w-4xl max-h-[85vh] cursor-grab active:cursor-grabbing"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: dragX > 0 ? -100 : 100 }}
                    animate={{ opacity: 1, x: dragX }}
                    exit={{ opacity: 0, x: dragX > 0 ? 100 : -100 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[activeIndex].url}
                      alt={images[activeIndex].alt_text || productName}
                      fill
                      priority
                      sizes="90vw"
                      className="object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                  {activeIndex + 1} / {images.length}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}