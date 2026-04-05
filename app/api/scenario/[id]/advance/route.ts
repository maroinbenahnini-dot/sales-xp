import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenario } from '@/lib/game/scenarios'
import { computeScore, resolveEnding } from '@/lib/game/scenario-engine'
import { resolveWeeklyEvent } from '@/lib/game/events'
import type { ScenarioRunState } from '@/types/game'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { run_id } = await req.json() as { run_id: string }

  const scenario = getScenario(id)
  if (!scenario) return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })

  const { data: run } = await supabase
    .from('scenario_runs')
    .select('*')
    .eq('id', run_id)
    .eq('user_id', user.id)
    .single()

  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })

  const nextWeek = run.current_week + 1
  const state: ScenarioRunState = run.state
  const isLastWeek = nextWeek > scenario.duration_weeks

  if (isLastWeek) {
    const score = computeScore(scenario, state)
    const ending = resolveEnding(scenario, score)
    const endingData = scenario.endings[ending]

    // Award XP
    const { data: profile } = await supabase.from('users').select('xp_total').eq('id', user.id).single()
    if (profile && endingData) {
      await supabase.from('users')
        .update({ xp_total: profile.xp_total + endingData.xp })
        .eq('id', user.id)
    }

    // Award badges
    for (const badgeKey of endingData?.badges ?? []) {
      await supabase.from('user_badges').upsert({ user_id: user.id, badge_key: badgeKey })
    }

    await supabase.from('scenario_runs').update({
      status: ending,
      score,
      xp_earned: endingData?.xp ?? 0,
      current_week: nextWeek,
      completed_at: new Date().toISOString(),
    }).eq('id', run_id)

    return NextResponse.json({ completed: true, score, ending, xp_earned: endingData?.xp ?? 0, narrative: endingData?.narrative ?? '' })
  }

  await supabase.from('scenario_runs').update({ current_week: nextWeek }).eq('id', run_id)

  // Pick a weekly event (deterministic, 35% chance)
  const triggeredIds: string[] = (state.events_triggered ?? [])
  const event = resolveWeeklyEvent(run_id, nextWeek, triggeredIds)

  return NextResponse.json({ completed: false, current_week: nextWeek, event: event ?? null })
}
