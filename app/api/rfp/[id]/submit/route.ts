import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRfp } from '@/lib/game/rfps'
import type { RfpRunState, TeamMember } from '@/types/game'

interface SubmitBody {
  run_id: string
  state: RfpRunState
}

interface ScoreBreakdown {
  coverage: number    // 0-100 : tâches couvertes par des membres qualifiés
  team: number        // 0-100 : qualité / disponibilité de l'équipe
  price: number       // 0-100 : compétitivité du prix
  total: number       // weighted total
}

function computeScore(
  rfpId: string,
  state: RfpRunState,
): { breakdown: ScoreBreakdown; result: 'won' | 'lost' } {
  const rfp = getRfp(rfpId)
  if (!rfp) return { breakdown: { coverage: 0, team: 0, price: 0, total: 0 }, result: 'lost' }

  const { team_pool, tasks, pricing_strategy } = rfp
  const memberMap = new Map<string, TeamMember>(team_pool.map(m => [m.id, m]))

  // ── Coverage score (40 %) ─────────────────────────────────────────────────
  let tasksFullyCovered = 0
  for (const task of tasks) {
    const assignedMemberId = state.task_assignments[task.id]
    if (!assignedMemberId) continue
    const member = memberMap.get(assignedMemberId)
    if (!member) continue
    const hasAllSkills = task.required_skills.every(s => member.skills.includes(s))
    if (hasAllSkills) tasksFullyCovered++
  }
  const coverage = Math.round((tasksFullyCovered / tasks.length) * 100)

  // ── Team score (30 %) ─────────────────────────────────────────────────────
  const selectedMembers = state.team_selected
    .map(id => memberMap.get(id))
    .filter(Boolean) as TeamMember[]

  const teamScore = selectedMembers.length === 0
    ? 0
    : Math.round(
        (selectedMembers.reduce((sum, m) => sum + m.availability, 0) / selectedMembers.length) * 100
      )

  // ── Price score (30 %) ────────────────────────────────────────────────────
  const { market_rate, aggressive_threshold, premium_threshold, competitor_estimate } = pricing_strategy
  const rate = state.daily_rate_chosen

  let priceScore: number
  if (rate < aggressive_threshold) {
    // Too cheap — margin risk, client may doubt quality
    priceScore = Math.max(0, Math.round(40 * (rate / aggressive_threshold)))
  } else if (rate > premium_threshold) {
    // Too expensive vs competitors
    priceScore = Math.max(0, Math.round(100 - ((rate - premium_threshold) / premium_threshold) * 200))
  } else if (rate <= competitor_estimate) {
    // Competitive zone : better than competitor
    const spread = competitor_estimate - aggressive_threshold
    const pos = rate - aggressive_threshold
    priceScore = Math.round(60 + (pos / spread) * 40)
  } else {
    // Above competitor but below premium — slight penalty
    const spread = premium_threshold - competitor_estimate
    const excess = rate - competitor_estimate
    priceScore = Math.max(50, Math.round(100 - (excess / spread) * 50))
  }
  // Bonus if close to market_rate (±10%)
  if (Math.abs(rate - market_rate) / market_rate <= 0.1) {
    priceScore = Math.min(100, priceScore + 10)
  }

  const total = Math.round(coverage * 0.4 + teamScore * 0.3 + priceScore * 0.3)

  return {
    breakdown: { coverage, team: teamScore, price: priceScore, total },
    result: total >= 65 ? 'won' : 'lost',
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: SubmitBody = await request.json()
  const { run_id, state } = body

  const rfp = getRfp(id)
  if (!rfp) return NextResponse.json({ error: 'RFP not found' }, { status: 404 })

  const { breakdown, result } = computeScore(id, state)
  const xp_earned = result === 'won' ? rfp.endings.won.xp : rfp.endings.lost.xp

  // Update rfp_run
  const { error: runError } = await supabase
    .from('rfp_runs')
    .update({
      status: result,
      score: breakdown.total,
      xp_earned,
      state,
      submitted_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', run_id)
    .eq('user_id', user.id)

  if (runError) {
    return NextResponse.json({ error: runError.message }, { status: 500 })
  }

  // Award XP
  const { data: profile } = await supabase
    .from('users')
    .select('xp_total')
    .eq('id', user.id)
    .single()

  if (profile) {
    await supabase
      .from('users')
      .update({ xp_total: profile.xp_total + xp_earned })
      .eq('id', user.id)
  }

  // Award badges
  const badges = result === 'won' ? rfp.endings.won.badges : rfp.endings.lost.badges
  for (const badge of badges) {
    await supabase
      .from('user_badges')
      .insert({ user_id: user.id, badge_key: badge })
      .select()
  }

  return NextResponse.json({ breakdown, result, xp_earned })
}
