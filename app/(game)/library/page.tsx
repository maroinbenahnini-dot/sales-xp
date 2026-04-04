import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAllScenarios, filterScenarios } from '@/lib/game/scenarios'
import { getAllRfps } from '@/lib/game/rfps'
import { ScenarioCard } from '@/components/game/scenario-card'
import { RfpCard } from '@/components/game/rfp-card'
import { LibraryFilters } from '@/components/game/library-filters'
import type { ScenarioTheme, ScenarioDifficulty, ScenarioStatus } from '@/types/game'

interface Props {
  searchParams: Promise<{ theme?: string; act?: string; difficulty?: string }>
}

export default async function LibraryPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [allScenarios, allRfps] = await Promise.all([
    Promise.resolve(getAllScenarios()),
    Promise.resolve(getAllRfps()),
  ])

  const filtered = filterScenarios(allScenarios, {
    theme: params.theme as ScenarioTheme | undefined,
    act: params.act ? (parseInt(params.act) as 1 | 2 | 3) : undefined,
    difficulty: params.difficulty as ScenarioDifficulty | undefined,
  })

  // Fetch user's completed runs for status
  const { data: runs } = user
    ? await supabase
        .from('scenario_runs')
        .select('scenario_id, status, score')
        .eq('user_id', user.id)
    : { data: [] }

  const runMap = new Map(runs?.map(r => [r.scenario_id, r]) ?? [])

  function getStatus(id: string): ScenarioStatus {
    const run = runMap.get(id)
    if (!run) return 'available'
    return run.status as ScenarioStatus
  }

  const act1Done = allScenarios
    .filter(s => s.act === 1)
    .every(s => getStatus(s.id) === 'won' || getStatus(s.id) === 'lost')

  function getStatusWithLock(id: string, act: number): ScenarioStatus {
    if (act === 2 && !act1Done) return 'locked'
    return getStatus(id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bibliothèque</h1>
        <p className="text-muted-foreground mt-1">
          Choisis ton prochain entraînement
        </p>
      </div>

      <Suspense>
        <LibraryFilters />
      </Suspense>

      {/* Scénarios */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Scénarios{' '}
          <span className="text-muted-foreground font-normal text-sm">
            ({filtered.length})
          </span>
        </h2>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun scénario pour ces filtres.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                status={getStatusWithLock(scenario.id, scenario.act)}
                score={runMap.get(scenario.id)?.score}
              />
            ))}
          </div>
        )}
      </section>

      {/* Appels d'Offre */}
      {allRfps.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Appels d&apos;Offre</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRfps.map(rfp => (
              <RfpCard
                key={rfp.id}
                rfp={rfp}
                status="available"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
