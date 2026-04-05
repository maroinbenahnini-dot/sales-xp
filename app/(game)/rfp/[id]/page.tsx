import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRfp } from '@/lib/game/rfps'
import { RfpPlayer } from '@/components/game/rfp-player'
import type { RfpRunState } from '@/types/game'

interface Props {
  params: Promise<{ id: string }>
}

const EMPTY_STATE: RfpRunState = {
  team_selected: [],
  task_assignments: {},
  daily_rate_chosen: 0,
  days_remaining: 0,
  sections_completed: [],
}

export default async function RfpPage({ params }: Props) {
  const { id } = await params

  const rfp = getRfp(id)
  if (!rfp) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  let { data: run } = await supabase
    .from('rfp_runs')
    .select('*')
    .eq('user_id', user.id)
    .eq('rfp_id', id)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (!run) {
    const { data: newRun } = await supabase
      .from('rfp_runs')
      .insert({
        user_id: user.id,
        rfp_id: id,
        status: 'in_progress',
        state: EMPTY_STATE,
      })
      .select()
      .single()
    run = newRun
  }

  if (!run) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <RfpPlayer
        rfp={rfp}
        runId={run.id}
        initialState={(run.state as RfpRunState) ?? EMPTY_STATE}
      />
    </div>
  )
}
