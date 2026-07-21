'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CartItemRow } from '@/components/shop/cart-item-row'
import type { CartItemWithProduct } from '@/lib/data/cart'

/**
 * Enveloppe client la liste des lignes du panier pour permettre une
 * animation de sortie (fade + collapse) quand un article est retiré.
 * Le state local est resynchronisé sur `items` à chaque changement
 * de props (ex: après un router.refresh() suite à une mise à jour
 * de quantité), et mis à jour de façon optimiste au retrait pour
 * laisser l'animation de sortie se jouer avant le refresh serveur.
 */
export function CartItemsList({ items }: { items: CartItemWithProduct[] }) {
  const [localItems, setLocalItems] = useState(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  function handleRemoved(id: string) {
    setLocalItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {localItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <CartItemRow item={item} onRemoved={handleRemoved} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
