import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllScenarios } from '@/lib/game/scenarios'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buttonVariants } from '@/components/ui/button'
import { computeXpProgress } from '@/lib/game/xp'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/game'

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps', infra: 'Infra', dwp: 'DWP',
  data: 'Data', cyber: 'Cyber', cloud: 'Cloud', tma: 'TMA',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, runsResult, badgesResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('scenario_runs').select('*').eq('user_id', user!.id).order('started_at', { ascending: false }),
    supabase.from('user_badges').select('*').eq('user_id', user!.id),
  ])

  const profile = profileResult.data as UserProfile
  const runs = runsResult.data ?? []
  const badges = badgesResult.data ?? []
  const allScenarios = getAllScenarios()

  const { level, nextLevel, progressPercent, xpIntoCurrentLevel, xpNeededForNext } =
    computeXpProgress(profile?.xp_total ?? 0)

  const wonRuns = runs.filter(r => r.status === 'won')
  const inProgressRun = runs.find(r => r.status === 'in_progress')
  const inProgressScenario = inProgressRun
    ? allScenarios.find(s => s.id === inProgressRun.scenario_id)
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

      {/* Hero — Profil & XP */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bienvenue, {profile?.username} 👋</h1>
            <p className="text-muted-foreground mt-1">{level.title}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Niv. {level.level}
          </Badge>
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

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{wonRuns.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Deals gagnés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{runs.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Scénarios joués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{badges.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Reprendre en cours */}
      {inProgressScenario && inProgressRun && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <p className="text-xs text-primary uppercase tracking-wide font-medium">En cours</p>
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
            <Link
              href={`/scenario/${inProgressScenario.id}`}
              className={cn(buttonVariants(), 'shrink-0')}
            >
              Reprendre →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* CTA si rien en cours */}
      {!inProgressScenario && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
          <p className="text-lg font-medium">Prêt à t&apos;entraîner ?</p>
          <p className="text-muted-foreground text-sm">
            Choisis un scénario et commence ton aventure commerciale.
          </p>
          <Link href="/library" className={cn(buttonVariants(), 'mt-2')}>
            Voir la bibliothèque →
          </Link>
        </div>
      )}

      {/* Historique récent */}
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
                  <div>
                    <p className="font-medium text-sm">{scenario.title}</p>
                    <p className="text-xs text-muted-foreground">{THEME_LABELS[scenario.theme]}</p>
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
