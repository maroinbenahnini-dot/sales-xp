import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenario } from '@/lib/game/scenarios'
import { applyEventEffects } from '@/lib/game/events'
import type { ScenarioRunState, WeeklyEventChoice } from '@/types/game'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { run_id, event_id, choice } = await req.json() as {
    run_id: string
    event_id: string
    choice: WeeklyEventChoice
  }

  const scenario = getScenario(id)
  if (!scenario) return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })

  const { data: run } = await supabase
    .from('scenario_runs')
    .select('state')
    .eq('id', run_id)
    .eq('user_id', user.id)
    .single()

  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })

  const state: ScenarioRunState = run.state

  // Apply effects (resolve generic _type keys)
  const currentRelations = Object.fromEntries(
    Object.entries(state.stakeholders).map(([k, v]) => [k, v.relation])
  )
  const updatedRelations = applyEventEffects(choice, scenario, currentRelations)

  const updatedStakeholders = { ...state.stakeholders }
  for (const [sid, newRelation] of Object.entries(updatedRelations)) {
    if (updatedStakeholders[sid]) {
      updatedStakeholders[sid] = { ...updatedStakeholders[sid], relation: newRelation }
    }
  }

  const updatedState: ScenarioRunState = {
    ...state,
    stakeholders: updatedStakeholders,
    events_triggered: [...(state.events_triggered ?? []), event_id],
  }

  await supabase
    .from('scenario_runs')
    .update({ state: updatedState })
    .eq('id', run_id)
    .eq('user_id', user.id)

  return NextResponse.json({ state: updatedState, action_bonus: choice.action_bonus ?? 0 })
}
