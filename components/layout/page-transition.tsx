'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Habille chaque page d'une transition fade + slide discrète au
 * changement de route. `key={pathname}` force le remount de l'enfant
 * pour que AnimatePresence détecte le changement et joue l'animation
 * de sortie/entrée. Respecte `prefers-reduced-motion` via
 * `useReducedMotion` (désactive le slide, garde un simple fade).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
