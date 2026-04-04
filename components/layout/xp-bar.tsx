'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from './logout-button'
import { useUserStore } from '@/store/user'
import { computeXpProgress } from '@/lib/game/xp'

export function XpBar() {
  const user = useUserStore((s) => s.user)

  if (!user) return null

  const { level, nextLevel, progressPercent, xpIntoCurrentLevel, xpNeededForNext } =
    computeXpProgress(user.xp_total)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight shrink-0">
          SalesXP
        </Link>

        <nav className="flex gap-4 text-sm text-muted-foreground shrink-0">
          <Link href="/library" className="hover:text-foreground transition-colors">
            Bibliothèque
          </Link>
        </nav>

        <div className="flex-1 flex items-center gap-3 max-w-xs ml-auto">
          <Badge variant="secondary" className="shrink-0 text-xs">
            Niv. {level.level}
          </Badge>

          <div className="flex-1 flex flex-col gap-0.5">
            <Progress value={progressPercent} className="h-2" />
            {nextLevel && (
              <span className="text-[10px] text-muted-foreground">
                {xpIntoCurrentLevel} / {xpNeededForNext} XP
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
            {user.username}
          </span>
        </div>

        <LogoutButton />
      </div>
    </header>
  )
}
