'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useScenarioStore } from '@/store/scenario'
import { AccountMap } from './account-map'
import { ActionPanel } from './action-panel'
import { WeekHeader } from './week-header'
import { buildInitialState } from '@/lib/game/scenario-engine'
import type { Scenario, ScenarioRunState } from '@/types/game'

interface Props {
  scenario: Scenario
  runId: string
  initialState: ScenarioRunState
  initialWeek: number
}

export function ScenarioPlayer({ scenario, runId, initialState, initialWeek }: Props) {
  const router = useRouter()
  const { initScenario, state } = useScenarioStore()
  const [ending, setEnding] = useState<{ score: number; narrative: string; xp_earned: number; result: string } | null>(null)

  useEffect(() => {
    initScenario(scenario, runId, initialState, initialWeek)
  }, [scenario, runId, initialState, initialWeek, initScenario])

  function handleWeekAdvanced(result: { completed: boolean; score?: number; ending?: string; narrative?: string; xp_earned?: number }) {
    if (result.completed && result.score !== undefined) {
      setEnding({
        score: result.score,
        narrative: result.narrative ?? '',
        xp_earned: result.xp_earned ?? 0,
        result: result.ending ?? 'pending',
      })
    }
  }

  if (!state) return null

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg">{scenario.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{scenario.context.company} · {scenario.context.industry}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">{scenario.context.deal_size}</p>
            <p className="text-xs text-muted-foreground">Enjeu</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">
          {scenario.context.brief}
        </p>
      </div>

      {/* Week header */}
      <WeekHeader
        scenarioId={scenario.id}
        runId={runId}
        totalWeeks={scenario.duration_weeks}
        onWeekAdvanced={handleWeekAdvanced}
      />

      {/* Account map */}
      <section>
        <h3 className="font-semibold mb-3">Carte du compte</h3>
        <AccountMap stakeholders={scenario.stakeholders} states={state.stakeholders} />
      </section>

      {/* Actions */}
      <section>
        <ActionPanel
          scenario={scenario}
          runId={runId}
          onActionDone={() => {}}
        />
      </section>

      {/* Ending modal */}
      <AnimatePresence>
        {ending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-card rounded-2xl border p-8 max-w-md w-full text-center space-y-4"
            >
              <div className="text-5xl">
                {ending.result === 'won' ? '🏆' : ending.result === 'lost' ? '😤' : '⏳'}
              </div>
              <h2 className="text-2xl font-bold">
                {ending.result === 'won' ? 'Deal Gagné !' : ending.result === 'lost' ? 'Deal Perdu' : 'En attente…'}
              </h2>
              <p className="text-4xl font-bold tabular-nums">
                {ending.score}<span className="text-lg text-muted-foreground">/100</span>
              </p>
              <p className="text-muted-foreground text-sm">{ending.narrative}</p>
              {ending.xp_earned > 0 && (
                <p className="text-primary font-semibold">+{ending.xp_earned} XP</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => router.push('/library')}
                  className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                >
                  Bibliothèque
                </button>
                <button
                  onClick={() => router.refresh()}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  Rejouer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
