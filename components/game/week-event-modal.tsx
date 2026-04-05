'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WeeklyEvent, WeeklyEventChoice, ScenarioRunState } from '@/types/game'

interface Props {
  event: WeeklyEvent
  scenarioId: string
  runId: string
  onResolved: (newState: ScenarioRunState, actionBonus: number) => void
}

const TYPE_STYLES = {
  opportunity: { border: 'border-green-500/40', bg: 'bg-green-500/5', badge: 'bg-green-500/20 text-green-400', label: 'Opportunité' },
  threat:      { border: 'border-red-500/40',   bg: 'bg-red-500/5',   badge: 'bg-red-500/20 text-red-400',   label: 'Menace' },
  neutral:     { border: 'border-yellow-500/40', bg: 'bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-400', label: 'Événement' },
}

export function WeekEventModal({ event, scenarioId, runId, onResolved }: Props) {
  const [chosen, setChosen] = useState<WeeklyEventChoice | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const style = TYPE_STYLES[event.type]

  async function handleChoice(choice: WeeklyEventChoice) {
    if (loading || chosen) return
    setLoading(true)
    setChosen(choice)

    const res = await fetch(`/api/scenario/${scenarioId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run_id: runId, event_id: event.id, choice }),
    })

    if (res.ok) {
      const data = await res.json()
      setFeedback(choice.feedback)
      // Give user a moment to read feedback before closing
      setTimeout(() => {
        onResolved(data.state, data.action_bonus)
      }, 2800)
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={`w-full max-w-lg rounded-2xl border-2 ${style.border} ${style.bg} bg-card p-6 space-y-4 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.label}
            </span>
            <h2 className="text-lg font-bold mt-2">{event.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          </div>
        </div>

        {/* Feedback after choice */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl border border-border bg-muted/40 p-4"
            >
              <p className="text-sm font-medium mb-1">Résultat</p>
              <p className="text-sm text-muted-foreground">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choices */}
        {!feedback && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Comment réagis-tu ?
            </p>
            {event.choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                disabled={loading || !!chosen}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                  chosen?.id === choice.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-muted/40 disabled:opacity-50'
                }`}
              >
                <span>{choice.label}</span>
                {choice.action_bonus && (
                  <span className="ml-2 text-xs text-primary font-medium">
                    +{choice.action_bonus} action
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <p className="text-xs text-center text-muted-foreground">
            Fermeture automatique…
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
