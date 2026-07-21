'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Transition de page volontairement discrète et rapide (180ms) :
 * l'objectif est d'adoucir la coupure brute entre deux pages, jamais
 * de ralentir la navigation perçue. Pas de slide ni de scale — un
 * simple fondu suffit à donner une sensation "fluide" sans coût
 * perceptible, conformément à l'esprit sobre du design (Linear/Vercel).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}