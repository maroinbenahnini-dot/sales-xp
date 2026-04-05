'use client'

import { motion } from 'framer-motion'
import type { Badge } from '@/types/game'

interface Props {
  badges: Badge[]
}

export function BadgesPanel({ badges }: Props) {
  const earned = badges.filter(b => b.earned_at)
  const locked = badges.filter(b => !b.earned_at)

  return (
    <div className="space-y-4">
      {earned.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Obtenus ({earned.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center"
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="text-xs font-semibold leading-tight">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            À débloquer ({locked.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locked.map(badge => (
              <div
                key={badge.key}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/20 p-4 text-center opacity-40"
              >
                <span className="text-3xl grayscale">{badge.icon}</span>
                <p className="text-xs font-semibold leading-tight">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucun badge pour l&apos;instant — joue des scénarios pour en débloquer.
        </p>
      )}
    </div>
  )
}
