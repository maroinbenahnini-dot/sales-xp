import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getScenario } from '@/lib/game/scenarios'
import { buildInitialState } from '@/lib/game/scenario-engine'
import { ScenarioPlayer } from '@/components/game/scenario-player'
import type { ScenarioRunState } from '@/types/game'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScenarioPage({ params }: Props) {
  const { id } = await params
  const scenario = getScenario(id)
  if (!scenario) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Find or create a run
  let { data: run } = await supabase
    .from('scenario_runs')
    .select('*')
    .eq('user_id', user.id)
    .eq('scenario_id', id)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (!run) {
    const initialState: ScenarioRunState = buildInitialState(scenario)
    const { data: newRun } = await supabase
      .from('scenario_runs')
      .insert({
        user_id: user.id,
        scenario_id: id,
        status: 'in_progress',
        current_week: 1,
        state: initialState,
      })
      .select()
      .single()
    run = newRun
  }

  if (!run) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ScenarioPlayer
        scenario={scenario}
        runId={run.id}
        initialState={run.state as ScenarioRunState}
        initialWeek={run.current_week}
      />
    </div>
  )
}
