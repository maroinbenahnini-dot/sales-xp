import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Rfp, ScenarioStatus } from '@/types/game'

const THEME_LABELS: Record<string, string> = {
  apps: 'Apps', infra: 'Infra', dwp: 'DWP',
  data: 'Data', cyber: 'Cyber', cloud: 'Cloud', tma: 'TMA',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400',
}

interface Props {
  rfp: Rfp
  status: ScenarioStatus
  score?: number
}

export function RfpCard({ rfp, status, score }: Props) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'won' || status === 'lost'

  return (
    <Card className={`flex flex-col transition-opacity ${isLocked ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Appel d&apos;Offre</p>
            <h3 className="font-semibold leading-tight">{rfp.title}</h3>
          </div>
          {isCompleted && score !== undefined && (
            <span className="text-lg font-bold tabular-nums shrink-0">
              {score}<span className="text-xs text-muted-foreground">/100</span>
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{rfp.context}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-xs">
            {THEME_LABELS[rfp.theme]}
          </Badge>
          <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[rfp.difficulty]}`}>
            {rfp.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {rfp.deal_size}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {rfp.deadline_days}j deadline
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        {isLocked ? (
          <Button variant="outline" className="w-full" disabled>🔒 Verrouillé</Button>
        ) : (
          <Link
            href={`/rfp/${rfp.id}`}
            className={cn(buttonVariants({ variant: isCompleted ? 'outline' : 'default' }), 'w-full text-center')}
          >
            {status === 'in_progress' ? 'Continuer' : isCompleted ? 'Rejouer' : 'Commencer'}
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
