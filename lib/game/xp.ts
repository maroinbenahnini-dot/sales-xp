import { getLevelFromXp, getNextLevel, LEVELS } from '@/types/game'

export function computeXpProgress(xpTotal: number): {
  level: typeof LEVELS[number]
  nextLevel: typeof LEVELS[number] | null
  progressPercent: number
  xpIntoCurrentLevel: number
  xpNeededForNext: number
} {
  const level = getLevelFromXp(xpTotal)
  const nextLevel = getNextLevel(level.level)

  if (!nextLevel) {
    return { level, nextLevel: null, progressPercent: 100, xpIntoCurrentLevel: 0, xpNeededForNext: 0 }
  }

  const xpIntoCurrentLevel = xpTotal - level.xp_required
  const xpNeededForNext = nextLevel.xp_required - level.xp_required
  const progressPercent = Math.round((xpIntoCurrentLevel / xpNeededForNext) * 100)

  return { level, nextLevel, progressPercent, xpIntoCurrentLevel, xpNeededForNext }
}
