'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useScenarioStore } from '@/store/scenario'
import { useUserStore } from '@/store/user'

interface Props {
  scenarioId: string
  runId: string
  totalWeeks: number
  onWeekAdvanced: (result: { completed: boolean; score?: number; ending?: string; narrative?: string; xp_earned?: number }) => void
}

export function WeekHeader({ scenarioId, runId, totalWeeks, onWeekAdvanced }: Props) {
  const [isPending, startTransition] = useTransition()
  const { currentWeek, actionsRemaining, advanceWeek } = useScenarioStore()
  const addXp = useUserStore(s => s.addXp)

  const weekProgress = ((currentWeek - 1) / totalWeeks) * 100

  function handleAdvance() {
    startTransition(async () => {
      const res = await fetch(`/api/scenario/${scenarioId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: runId }),
      })

      if (!res.ok) {
        toast.error('Erreur lors du passage à la semaine suivante')
        return
      }

      const data = await res.json()

      if (data.completed) {
        if (data.xp_earned) addXp(data.xp_earned)
        onWeekAdvanced(data)
      } else {
        advanceWeek()
        onWeekAdvanced(data)
      }
    })
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium">Semaine {currentWeek} / {totalWeeks}</span>
          <span className="text-muted-foreground">{actionsRemaining} action{actionsRemaining > 1 ? 's' : ''} restante{actionsRemaining > 1 ? 's' : ''}</span>
        </div>
        <Progress value={weekProgress} className="h-2" />
      </div>

      <Button
        onClick={handleAdvance}
        disabled={isPending}
        size="sm"
      >
        {isPending ? '…' : currentWeek >= totalWeeks ? 'Terminer' : 'Semaine suivante →'}
      </Button>
    </div>
  )
}
