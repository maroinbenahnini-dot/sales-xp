'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ActionType, ActionChoice, Scenario, ScenarioRunState } from '@/types/game'

const ACTION_LABELS: Record<ActionType, string> = {
  email: '✉️ Email',
  meeting_request: '📅 Réunion',
  lunch: '🍽️ Déjeuner',
  proposal: '📄 Proposition',
  reference_visit: '🏢 Visite référence',
  event_response: '⚡ Événement',
}

interface Props {
  scenario: Scenario
  runId: string
  actionsRemaining: number
  onActionDone: (newState: ScenarioRunState, cost: number) => void
}

export function ActionPanel({ scenario, runId, actionsRemaining, onActionDone }: Props) {
  const [selectedType, setSelectedType] = useState<ActionType | null>(null)
  const [lastFeedback, setLastFeedback] = useState<ActionChoice['feedback'] | null>(null)
  const [isPending, startTransition] = useTransition()

  const availableActions = Object.entries(scenario.actions) as [ActionType, typeof scenario.actions[ActionType]][]

  function selectAction(type: ActionType) {
    setLastFeedback(null)
    setSelectedType(type === selectedType ? null : type)
  }

  function submitChoice(actionType: ActionType, choice: ActionChoice) {
    const action = scenario.actions[actionType]
    if (actionsRemaining < action.cost) {
      toast.error("Plus assez d'actions cette semaine")
      return
    }

    startTransition(async () => {
      const res = await fetch(`/api/scenario/${scenario.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType, choice_id: choice.id, run_id: runId }),
      })

      if (!res.ok) {
        toast.error("Erreur lors de l'action")
        return
      }

      const data = await res.json()
      setLastFeedback(data.feedback)
      setSelectedType(null)
      onActionDone(data.state, action.cost)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Actions disponibles</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: scenario.actions_per_week }).map((_, i) => (
              <div
                key={i}
                className={`size-3 rounded-full ${i < actionsRemaining ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {actionsRemaining}/{scenario.actions_per_week}
          </span>
        </div>
      </div>

      {/* Action type selector */}
      <div className="flex flex-wrap gap-2">
        {availableActions.map(([type, action]) => (
          <button
            key={type}
            onClick={() => selectAction(type)}
            disabled={actionsRemaining < action.cost || isPending}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              selectedType === type
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {ACTION_LABELS[type]}
            {action.cost > 1 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {action.cost} actions
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Choices */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">Choisis ton approche :</p>
            {scenario.actions[selectedType].choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => submitChoice(selectedType, choice)}
                disabled={isPending}
                className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm disabled:opacity-50"
              >
                {choice.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback panel */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{lastFeedback.result}</p>
                  <button
                    onClick={() => setLastFeedback(null)}
                    className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pourquoi</p>
                  <p>{lastFeedback.explanation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Ce qu&apos;il fallait faire
                  </p>
                  <p className="text-primary">{lastFeedback.optimal}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Compétence : {lastFeedback.skill}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
