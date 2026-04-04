import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenario } from '@/lib/game/scenarios'
import { checkChampionThreshold } from '@/lib/game/scenario-engine'
import type { ScenarioRunState, ActionType } from '@/types/game'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { action_type: ActionType; choice_id: string; run_id: string }
  const { action_type, choice_id, run_id } = body

  const scenario = getScenario(id)
  if (!scenario) return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })

  const { data: run } = await supabase
    .from('scenario_runs')
    .select('*')
    .eq('id', run_id)
    .eq('user_id', user.id)
    .single()

  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  if (run.status !== 'in_progress') return NextResponse.json({ error: 'Run already completed' }, { status: 400 })

  const action = scenario.actions[action_type]
  if (!action) return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })

  const choice = action.choices.find(c => c.id === choice_id)
  if (!choice) return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })

  const state: ScenarioRunState = run.state

  // Apply effects
  Object.entries(choice.effects).forEach(([stakeholderId, delta]) => {
    if (state.stakeholders[stakeholderId]) {
      const current = state.stakeholders[stakeholderId].relation
      const next = Math.min(100, Math.max(0, current + delta))
      state.stakeholders[stakeholderId].relation = next
      state.stakeholders[stakeholderId].interaction_count += 1
      if (checkChampionThreshold(next)) {
        state.stakeholders[stakeholderId].is_champion = true
      }
    }
  })

  // Record history
  state.actions_history.push({
    week: run.current_week,
    action_type,
    choice_id,
    effects: choice.effects,
  })

  await supabase
    .from('scenario_runs')
    .update({ state })
    .eq('id', run_id)

  return NextResponse.json({ effects: choice.effects, feedback: choice.feedback, state })
}
