import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllScenarios } from '@/lib/game/scenarios'
import { getAllRfps } from '@/lib/game/rfps'
import { enrichBadges } from '@/lib/game/badges'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BadgesPanel } from '@/components/game/badges-panel'
import { computeXpProgress } from '@/lib/game/xp'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/game'

const btnClass = 'inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 transition-colors hover:bg-primary/90'

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps', infra: 'Infra', dwp: 'DWP',
  data: 'Data', cyber: 'Cyber', cloud: 'Cloud', tma: 'TMA',
}

const THEME_ICONS: Record<string, string> = {
  apps: '📱', infra: '🖥️', dwp: '💼', data: '📊', cyber: '🛡️', cloud: '☁️', tma: '🔧',
}

function computeReputation(wonRuns: number, totalRuns: number, avgScore: number, badgeCount: number): number {
  if (totalRuns === 0) return 0
  const winRate = wonRuns / totalRuns        // 0-1
  const scoreBonus = (avgScore / 100) * 200  // 0-200
  const winBonus = winRate * 400             // 0-400
  const badgeBonus = Math.min(badgeCount * 25, 200) // 0-200 (capped)
  const playBonus = Math.min(totalRuns * 10, 200)   // 0-200 (capped)
  return Math.min(1000, Math.round(scoreBonus + winBonus + badgeBonus + playBonus))
}

function reputationLabel(rep: number): { label: string; color: string } {
  if (rep >= 800) return { label: 'Légende', color: 'text-yellow-400' }
  if (rep >= 600) return { label: 'Expert', color: 'text-blue-400' }
  if (rep >= 400) return { label: 'Confirmé', color: 'text-green-400' }
  if (rep >= 200) return { label: 'En progression', color: 'text-muted-foreground' }
  return { label: 'Débutant', color: 'text-muted-foreground' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, runsResult, rfpRunsResult, badgesResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('scenario_runs').select('*').eq('user_id', user!.id).order('started_at', { ascending: false }),
    supabase.from('rfp_runs').select('*').eq('user_id', user!.id).order('started_at', { ascending: false }),
    supabase.from('user_badges').select('badge_key, earned_at').eq('user_id', user!.id),
  ])

  const profile = profileResult.data as UserProfile
  const runs = runsResult.data ?? []
  const rfpRuns = rfpRunsResult.data ?? []
  const earnedBadges = badgesResult.data ?? []
  const allBadges = enrichBadges(earnedBadges)
  const allScenarios = getAllScenarios()
  const allRfps = getAllRfps()

  const { level, nextLevel, progressPercent, xpIntoCurrentLevel, xpNeededForNext } =
    computeXpProgress(profile?.xp_total ?? 0)

  const wonRuns = runs.filter(r => r.status === 'won')
  const completedRuns = runs.filter(r => r.status === 'won' || r.status === 'lost')
  const avgScore = completedRuns.length
    ? Math.round(completedRuns.reduce((s, r) => s + (r.score ?? 0), 0) / completedRuns.length)
    : 0

  const reputation = computeReputation(wonRuns.length, completedRuns.length, avgScore, earnedBadges.length)
  const repLabel = reputationLabel(reputation)

  const inProgressRun = runs.find(r => r.status === 'in_progress')
  const inProgressScenario = inProgressRun ? allScenarios.find(s => s.id === inProgressRun.scenario_id) : null
  const inProgressRfp = rfpRuns.find(r => r.status === 'in_progress')
  const inProgressRfpData = inProgressRfp ? allRfps.find(r => r.id === inProgressRfp.rfp_id) : null

  // Skill breakdown by theme
  const themeStats = Object.keys(THEME_LABELS).map(theme => {
    const themeRuns = completedRuns.filter(r => {
      const sc = allScenarios.find(s => s.id === r.scenario_id)
      return sc?.theme === theme
    })
    const themeWins = themeRuns.filter(r => r.status === 'won').length
    return { theme, played: themeRuns.length, won: themeWins }
  }).filter(t => t.played > 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

      {/* ── Hero XP ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bienvenue, {profile?.username} 👋</h1>
            <p className="text-muted-foreground mt-0.5">{level.title}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-lg px-3 py-1 mb-1">
              Niv. {level.level}
            </Badge>
            <p className={`text-xs font-medium ${repLabel.color}`}>{repLabel.label}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {xpIntoCurrentLevel} / {xpNeededForNext} XP
            </span>
            {nextLevel && (
              <span className="text-muted-foreground">
                Prochain : {nextLevel.title}
              </span>
            )}
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {profile?.xp_total ?? 0} XP au total
          </p>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{wonRuns.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Deals gagnés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{completedRuns.length > 0 ? avgScore : '—'}</p>
            <p className="text-sm text-muted-foreground mt-1">Score moyen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className={`text-3xl font-bold ${repLabel.color}`}>{reputation}</p>
            <p className="text-sm text-muted-foreground mt-1">Réputation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{earnedBadges.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* ── En cours ────────────────────────────────────────────────────────── */}
      {inProgressScenario && inProgressRun && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <p className="text-xs text-primary uppercase tracking-wide font-medium">Scénario en cours</p>
            <h2 className="text-lg font-semibold">{inProgressScenario.title}</h2>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Semaine {inProgressRun.current_week} / {inProgressScenario.duration_weeks}</span>
                <span>{THEME_LABELS[inProgressScenario.theme]}</span>
              </div>
              <Progress
                value={(inProgressRun.current_week / inProgressScenario.duration_weeks) * 100}
                className="h-2"
              />
            </div>
            <Link href={`/scenario/${inProgressScenario.id}`} className={cn(btnClass, 'shrink-0')}>
              Reprendre →
            </Link>
          </CardContent>
        </Card>
      )}

      {inProgressRfpData && inProgressRfp && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <p className="text-xs text-primary uppercase tracking-wide font-medium">Appel d&apos;Offre en cours</p>
            <h2 className="text-lg font-semibold">{inProgressRfpData.title}</h2>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{inProgressRfpData.client}</p>
            <Link href={`/rfp/${inProgressRfpData.id}`} className={cn(btnClass, 'shrink-0')}>
              Reprendre →
            </Link>
          </CardContent>
        </Card>
      )}

      {!inProgressScenario && !inProgressRfpData && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
          <p className="text-lg font-medium">Prêt à t&apos;entraîner ?</p>
          <p className="text-muted-foreground text-sm">
            Choisis un scénario ou réponds à un appel d&apos;offre.
          </p>
          <Link href="/library" className={cn(btnClass, 'mt-2')}>
            Voir la bibliothèque →
          </Link>
        </div>
      )}

      {/* ── Compétences par thème ────────────────────────────────────────────── */}
      {themeStats.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Compétences par thème</h2>
          <div className="space-y-3">
            {themeStats.map(({ theme, played, won }) => {
              const winRate = Math.round((won / played) * 100)
              return (
                <div key={theme} className="rounded-xl border bg-card px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{THEME_ICONS[theme]}</span>
                      <span className="font-medium text-sm">{THEME_LABELS[theme]}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {won}/{played} gagné{won > 1 ? 's' : ''} · {winRate}%
                    </div>
                  </div>
                  <Progress value={winRate} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Badges ──────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-semibold mb-4">Badges</h2>
        <BadgesPanel badges={allBadges} />
      </section>

      {/* ── Historique récent ────────────────────────────────────────────────── */}
      {runs.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Historique récent</h2>
          <div className="space-y-2">
            {runs.slice(0, 5).map(run => {
              const scenario = allScenarios.find(s => s.id === run.scenario_id)
              if (!scenario) return null
              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{THEME_ICONS[scenario.theme]}</span>
                    <div>
                      <p className="font-medium text-sm">{scenario.title}</p>
                      <p className="text-xs text-muted-foreground">{THEME_LABELS[scenario.theme]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {run.status === 'in_progress' ? (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                        En cours
                      </Badge>
                    ) : run.status === 'won' ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        ✓ Gagné · {run.score}/100
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        Perdu · {run.score}/100
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
