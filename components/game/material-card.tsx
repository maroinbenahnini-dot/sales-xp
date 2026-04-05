'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { SalesMaterial } from '@/types/game'

const THEME_ICONS: Record<string, string> = {
  apps: '📱', infra: '🖥️', dwp: '💼', data: '📊', cyber: '🛡️', cloud: '☁️', tma: '🔧',
}

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps', infra: 'Infra', dwp: 'DWP', data: 'Data', cyber: 'Cyber', cloud: 'Cloud', tma: 'TMA',
}

const TYPE_LABELS: Record<string, string> = {
  cheatsheet: 'Cheat Sheet', glossary: 'Glossaire', pitch: 'Pitch', objections: 'Objections', methodo: 'Méthodo',
}

const TYPE_COLORS: Record<string, string> = {
  cheatsheet:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  glossary:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  pitch:       'bg-green-500/15 text-green-400 border-green-500/30',
  objections:  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  methodo:     'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

interface Props { material: SalesMaterial }

export function MaterialCard({ material }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0">{THEME_ICONS[material.theme]}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight">{material.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{material.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[material.type]}`}>
            {TYPE_LABELS[material.type]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            {THEME_LABELS[material.theme]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            {material.read_time_min} min
          </span>
        </div>

        {material.key_numbers && material.key_numbers.length > 0 && (
          <p className="text-[11px] text-muted-foreground italic line-clamp-1">
            💡 {material.key_numbers[0]}
          </p>
        )}
      </div>

      <div className="px-4 pb-4">
        <Link
          href={`/materials/${material.id}`}
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'w-full text-center')}
        >
          Lire →
        </Link>
      </div>
    </div>
  )
}
