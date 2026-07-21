'use client'

import { AnimatePresence, motion } from 'framer-motion'

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: '0.375rem' }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="overflow-hidden text-sm text-danger"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
