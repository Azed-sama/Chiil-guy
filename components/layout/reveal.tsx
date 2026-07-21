'use client'

import { motion } from 'framer-motion'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * Fait apparaître son contenu (fade + slide) quand il entre dans le
 * viewport, une seule fois (`once: true`). Utilisé pour animer les
 * sections de la page d'accueil et de la page à propos au scroll,
 * sans dépendre d'un observer géré à la main dans chaque page.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
