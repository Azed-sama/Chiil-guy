'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      <div className="flex aspect-square items-center justify-center rounded-lg bg-paper-muted text-ink-muted">
        <ImageOff className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-paper-muted">
        <Image
          src={active.url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3" role="tablist" aria-label="Images du produit">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded border-2 transition-colors',
                index === activeIndex ? 'border-accent' : 'border-transparent hover:border-border'
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
