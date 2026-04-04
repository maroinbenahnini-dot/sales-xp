'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Scenario, ScenarioStatus } from '@/types/game'

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps',
  infra: 'Infra',
  dwp: 'DWP',
  data: 'Data',
  cyber: 'Cyber',
  cloud: 'Cloud',
  tma: 'TMA',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Facile',
  medium: 'Intermédiaire',
  hard: 'Difficile',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

const ACT_LABELS: Record<number, string> = {
  1: 'Acte I — Les Fondations',
  2: 'Acte II — La Montée en Puissance',
  3: 'Acte III — Le Grand Jeu',
}

interface Props {
  scenario: Scenario
  status: ScenarioStatus
  score?: number
}

export function ScenarioCard({ scenario, status, score }: Props) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'won' || status === 'lost'

  return (
    <Card className={`flex flex-col transition-opacity ${isLocked ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {ACT_LABELS[scenario.act]}
            </p>
            <h3 className="font-semibold leading-tight">{scenario.title}</h3>
          </div>
          {isCompleted && score !== undefined && (
            <span className="text-lg font-bold tabular-nums shrink-0">
              {score}<span className="text-xs text-muted-foreground">/100</span>
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {scenario.context.brief}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-xs">
            {THEME_LABELS[scenario.theme]}
          </Badge>
          <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
            {DIFFICULTY_LABELS[scenario.difficulty]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {scenario.duration_weeks} semaines
          </Badge>
          <Badge variant="outline" className="text-xs">
            {scenario.stakeholders.length} interlocuteurs
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        {isLocked ? (
          <Button variant="outline" className="w-full" disabled>
            🔒 Verrouillé
          </Button>
        ) : (
          <Link
            href={`/scenario/${scenario.id}`}
            className={cn(buttonVariants({ variant: isCompleted ? 'outline' : 'default' }), 'w-full text-center')}
          >
            {status === 'in_progress' ? 'Continuer' : isCompleted ? 'Rejouer' : 'Commencer'}
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
