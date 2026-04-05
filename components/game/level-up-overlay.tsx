'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/user'

export function LevelUpOverlay() {
  const levelUpEvent = useUserStore(s => s.levelUpEvent)
  const clearLevelUp = useUserStore(s => s.clearLevelUp)

  useEffect(() => {
    if (!levelUpEvent) return
    const t = setTimeout(clearLevelUp, 4000)
    return () => clearTimeout(t)
  }, [levelUpEvent, clearLevelUp])

  return (
    <AnimatePresence>
      {levelUpEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="relative z-10 text-center px-12 py-10 rounded-3xl border-2 border-primary bg-card shadow-2xl"
          >
            {/* Burst rings */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 2.5 + i * 0.6, opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                className="absolute inset-0 rounded-3xl border border-primary/40"
              />
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-6xl mb-4"
            >
              ⭐
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground uppercase tracking-widest mb-1"
            >
              Niveau supérieur !
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-primary mb-2"
            >
              Niveau {levelUpEvent.newLevel}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-semibold"
            >
              {levelUpEvent.newTitle}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
