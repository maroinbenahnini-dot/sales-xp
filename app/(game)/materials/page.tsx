import { Suspense } from 'react'
import { getAllMaterials, filterMaterials } from '@/lib/game/materials'
import { MaterialCard } from '@/components/game/material-card'
import type { ScenarioTheme, MaterialType } from '@/types/game'

const THEMES: { value: ScenarioTheme | 'all'; label: string; icon: string }[] = [
  { value: 'all',   label: 'Tout',   icon: '📚' },
  { value: 'cloud', label: 'Cloud',  icon: '☁️' },
  { value: 'cyber', label: 'Cyber',  icon: '🛡️' },
  { value: 'data',  label: 'Data',   icon: '📊' },
  { value: 'apps',  label: 'Apps',   icon: '📱' },
  { value: 'infra', label: 'Infra',  icon: '🖥️' },
  { value: 'dwp',   label: 'DWP',    icon: '💼' },
  { value: 'tma',   label: 'TMA',    icon: '🔧' },
]

const TYPES: { value: MaterialType | 'all'; label: string }[] = [
  { value: 'all',        label: 'Tous les types' },
  { value: 'cheatsheet', label: 'Cheat Sheet' },
  { value: 'glossary',   label: 'Glossaire' },
  { value: 'objections', label: 'Objections' },
  { value: 'pitch',      label: 'Pitch' },
  { value: 'methodo',    label: 'Méthodo' },
]

interface Props {
  searchParams: Promise<{ theme?: string; type?: string }>
}

export default async function MaterialsPage({ searchParams }: Props) {
  const params = await searchParams
  const theme = params.theme as ScenarioTheme | undefined
  const type = params.type as MaterialType | undefined

  const all = getAllMaterials()
  const filtered = filterMaterials(all, { theme, type })

  const totalReadTime = filtered.reduce((s, m) => s + m.read_time_min, 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Material</h1>
        <p className="text-muted-foreground mt-1">
          Tout ce qu&apos;un Sales ESN doit savoir — concis, actionnable, terrain.
        </p>
      </div>

      {/* Theme filter (chips) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        {THEMES.map(t => {
          const isActive = (!theme && t.value === 'all') || theme === t.value
          const href = t.value === 'all'
            ? '/materials'
            : `/materials?theme=${t.value}${type ? `&type=${type}` : ''}`
          return (
            <a
              key={t.value}
              href={href}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </a>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        {TYPES.map(t => {
          const isActive = (!type && t.value === 'all') || type === t.value
          const base = theme ? `/materials?theme=${theme}` : '/materials'
          const href = t.value === 'all' ? base : `${base}${base.includes('?') ? '&' : '?'}type=${t.value}`
          return (
            <a
              key={t.value}
              href={href}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-muted text-foreground border-border'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </a>
          )
        })}
      </div>

      {/* Stats */}
      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} ressource{filtered.length > 1 ? 's' : ''} · {totalReadTime} min de lecture
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📭</p>
          <p>Aucune ressource pour ces filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(material => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  )
}
