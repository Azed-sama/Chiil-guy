'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

/**
 * Wrapper client dédié UNIQUEMENT à l'animation d'apparition en cascade.
 * Les <ProductCard> sont passés en `children` (déjà rendus côté serveur
 * par ProductGrid, un Server Component) plutôt qu'importés ici — ça
 * préserve le rendu serveur du contenu (SEO) tout en ajoutant l'anim.
 */
export function AnimatedGrid({ children }: { children: React.ReactNode[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}