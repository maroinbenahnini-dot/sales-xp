'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Stakeholder, StakeholderState, StakeholderType } from '@/types/game'

const TYPE_LABELS: Record<StakeholderType, string> = {
  decision_maker: 'Décideur',
  influencer: 'Influenceur',
  blocker: 'Bloqueur',
  champion: 'Champion',
}

const RELATION_COLOR = (rel: number) => {
  if (rel >= 75) return 'text-green-400'
  if (rel >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

const RELATION_LABEL = (rel: number) => {
  if (rel >= 75) return 'Champion'
  if (rel >= 60) return 'Favorable'
  if (rel >= 40) return 'Neutre'
  if (rel >= 20) return 'Froid'
  return 'Hostile'
}

interface Props {
  stakeholders: Stakeholder[]
  states: Record<string, StakeholderState>
}

export function AccountMap({ stakeholders, states }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedStakeholder = stakeholders.find(s => s.id === selected)
  const selectedState = selected ? states[selected] : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stakeholder grid */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stakeholders.map(s => {
          const state = states[s.id]
          if (!state) return null
          const isSelected = selected === s.id

          return (
            <motion.button
              key={s.id}
              onClick={() => setSelected(isSelected ? null : s.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left rounded-xl border p-3 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.role}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${RELATION_COLOR(state.relation)}`}>
                    {RELATION_LABEL(state.relation)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {state.relation}/100
                  </span>
                </div>
                <Progress value={state.relation} className="h-1.5" />
              </div>

              {state.is_champion && (
                <Badge className="mt-2 text-[10px]" variant="secondary">⭐ Champion</Badge>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedStakeholder && selectedState ? (
          <motion.div
            key={selectedStakeholder.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                    {selectedStakeholder.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStakeholder.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedStakeholder.role}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{TYPE_LABELS[selectedStakeholder.type]}</Badge>
                  <Badge variant="outline">
                    {'⭐'.repeat(selectedStakeholder.influence)} Influence
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Motivation
                  </p>
                  <p>{selectedStakeholder.visible_motivation}</p>
                </div>

                {selectedState.interaction_count >= 2 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Frein découvert
                    </p>
                    <p className="text-yellow-400">{selectedStakeholder.hidden_fear}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Canal préféré
                  </p>
                  <p className="capitalize">{selectedStakeholder.preferred_channel}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Interactions
                  </p>
                  <p>{selectedState.interaction_count} contact{selectedState.interaction_count > 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground text-sm"
          >
            Clique sur un stakeholder
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
