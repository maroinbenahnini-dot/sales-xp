import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllScenarios } from '@/lib/game/scenarios'
import { getAllRfps } from '@/lib/game/rfps'
import { enrichBadges } from '@/lib/game/badges'
import { computeXpProgress } from '@/lib/game/xp'
import { BadgesPanel } from '@/components/game/badges-panel'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { UserProfile } from '@/types/game'

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps', infra: 'Infra', dwp: 'DWP',
  data: 'Data', cyber: 'Cyber', cloud: 'Cloud', tma: 'TMA',
}

const THEME_ICONS: Record<string, string> = {
  apps: '📱', infra: '🖥️', dwp: '💼', data: '📊', cyber: '🛡️', cloud: '☁️', tma: '🔧',
}

const SKILL_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  financial_framing: 'Business Case',
  executive_engagement: 'C-Level',
  objection_handling: 'Objections',
  social_proof: 'Références',
  deal_structuring: 'Structuration',
  stakeholder_alignment: 'Alignement',
  change_management: 'Conduite du changement',
  technical_credibility: 'Crédibilité technique',
  regulatory_framing: 'Réglementaire',
  co_construction: 'Co-construction',
  demonstration: 'Démonstration',
  personalization: 'Personnalisation',
  facilitation: 'Facilitation',
  intelligence_gathering: 'Intelligence',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [profileResult, runsResult, rfpRunsResult, badgesResult, skillsResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('scenario_runs').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
    supabase.from('rfp_runs').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
    supabase.from('user_badges').select('badge_key, earned_at').eq('user_id', user.id),
    supabase.from('user_skills').select('*').eq('user_id', user.id),
  ])

  const profile = profileResult.data as UserProfile | null
  if (!profile) notFound()

  const runs = runsResult.data ?? []
  const rfpRuns = rfpRunsResult.data ?? []
  const earnedBadges = badgesResult.data ?? []
  const skills = skillsResult.data ?? []
  const allBadges = enrichBadges(earnedBadges)
  const allScenarios = getAllScenarios()
  const allRfps = getAllRfps()

  const { level, nextLevel, progressPercent, xpIntoCurrentLevel, xpNeededForNext } =
    computeXpProgress(profile.xp_total)

  const completedRuns = runs.filter(r => r.status === 'won' || r.status === 'lost')
  const wonRuns = runs.filter(r => r.status === 'won')
  const avgScore = completedRuns.length
    ? Math.round(completedRuns.reduce((s, r) => s + (r.score ?? 0), 0) / completedRuns.length)
    : 0

  const completedRfps = rfpRuns.filter(r => r.status === 'won' || r.status === 'lost')
  const wonRfps = rfpRuns.filter(r => r.status === 'won')

  // Initials for avatar
  const initials = profile.username.slice(0, 2).toUpperCase()

  // Skill breakdown from actions_history in runs
  const skillCounts: Record<string, number> = {}
  for (const run of completedRuns) {
    const state = run.state
    if (!state?.actions_history) continue
    for (const action of state.actions_history) {
      const sc = allScenarios.find(s => s.id === run.scenario_id)
      if (!sc) continue
      const actionDef = sc.actions[action.action_type as keyof typeof sc.actions]
      const choice = actionDef?.choices.find(c => c.id === action.choice_id)
      if (choice?.feedback?.skill) {
        skillCounts[choice.feedback.skill] = (skillCounts[choice.feedback.skill] ?? 0) + 1
      }
    }
  }
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-primary">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.username}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">Niv. {level.level}</Badge>
              <span className="text-sm text-muted-foreground">{level.title}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-3xl font-black tabular-nums">{profile.xp_total}</p>
            <p className="text-xs text-muted-foreground">XP total</p>
          </div>
        </div>

        {/* XP Progress */}
        {nextLevel && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{xpIntoCurrentLevel} / {xpNeededForNext} XP vers {nextLevel.title}</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Scénarios gagnés', value: wonRuns.length },
          { label: 'Scénarios joués', value: completedRuns.length },
          { label: 'AO gagnées', value: wonRfps.length },
          { label: 'Score moyen', value: avgScore || '—' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Compétences utilisées ─────────────────────────────────────────────── */}
      {topSkills.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Compétences les plus pratiquées</h2>
          <div className="space-y-2.5">
            {topSkills.map(([skill, count]) => {
              const maxCount = topSkills[0][1]
              const pct = Math.round((count / maxCount) * 100)
              return (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="text-muted-foreground">{count} fois</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Historique scénarios ─────────────────────────────────────────────── */}
      {runs.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Historique des scénarios</h2>
          <div className="space-y-2">
            {runs.map(run => {
              const sc = allScenarios.find(s => s.id === run.scenario_id)
              if (!sc) return null
              return (
                <div key={run.id} className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card">
                  <div className="flex items-center gap-2.5">
                    <span>{THEME_ICONS[sc.theme]}</span>
                    <div>
                      <p className="text-sm font-medium">{sc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Acte {sc.act} · {THEME_LABELS[sc.theme]}
                      </p>
                    </div>
                  </div>
                  {run.status === 'in_progress' ? (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 shrink-0">En cours</Badge>
                  ) : run.status === 'won' ? (
                    <Badge variant="outline" className="text-green-400 border-green-400/30 shrink-0">✓ {run.score}/100</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-400 border-red-400/30 shrink-0">✗ {run.score}/100</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Historique AO ────────────────────────────────────────────────────── */}
      {rfpRuns.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Historique des appels d&apos;offre</h2>
          <div className="space-y-2">
            {rfpRuns.map(run => {
              const rfp = allRfps.find(r => r.id === run.rfp_id)
              if (!rfp) return null
              return (
                <div key={run.id} className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card">
                  <div className="flex items-center gap-2.5">
                    <span>{THEME_ICONS[rfp.theme]}</span>
                    <div>
                      <p className="text-sm font-medium">{rfp.title}</p>
                      <p className="text-xs text-muted-foreground">{rfp.deal_size}</p>
                    </div>
                  </div>
                  {run.status === 'won' ? (
                    <Badge variant="outline" className="text-green-400 border-green-400/30 shrink-0">✓ {run.score}/100</Badge>
                  ) : run.status === 'lost' ? (
                    <Badge variant="outline" className="text-red-400 border-red-400/30 shrink-0">✗ {run.score}/100</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 shrink-0">En cours</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Badges ──────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-semibold mb-4">Collection de badges</h2>
        <BadgesPanel badges={allBadges} />
      </section>
    </div>
  )
}
