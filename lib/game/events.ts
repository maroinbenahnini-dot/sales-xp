import fs from 'fs'
import path from 'path'
import type { WeeklyEvent, WeeklyEventChoice, Scenario } from '@/types/game'

const EVENTS_PATH = path.join(process.cwd(), 'content', 'events', 'events.json')

let _cache: WeeklyEvent[] | null = null

function loadEvents(): WeeklyEvent[] {
  if (_cache) return _cache
  const raw = fs.readFileSync(EVENTS_PATH, 'utf-8')
  _cache = JSON.parse(raw) as WeeklyEvent[]
  return _cache
}

// 35% chance of an event per week; seeded by run_id + week for determinism
function shouldTriggerEvent(runId: string, week: number): boolean {
  const seed = runId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hash = (seed * 31 + week * 17) % 100
  return hash < 35
}

function pickEvent(runId: string, week: number, triggeredIds: string[]): WeeklyEvent | null {
  const events = loadEvents()
  const seed = runId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  // Filter out already-triggered events for variety
  const available = events.filter(e => !triggeredIds.includes(e.id))
  if (available.length === 0) return null

  const idx = (seed + week * 7) % available.length
  return available[idx]
}

export function resolveWeeklyEvent(
  runId: string,
  week: number,
  triggeredIds: string[],
): WeeklyEvent | null {
  if (!shouldTriggerEvent(runId, week)) return null
  return pickEvent(runId, week, triggeredIds)
}

/**
 * Apply event choice effects to stakeholder relations.
 * Effects use generic type keys (_decision_maker, _champion, _blocker, _influencer)
 * that are resolved against actual stakeholder types in the scenario.
 */
export function applyEventEffects(
  choice: WeeklyEventChoice,
  scenario: Scenario,
  stakeholderRelations: Record<string, number>,
): Record<string, number> {
  const updated = { ...stakeholderRelations }

  for (const [key, delta] of Object.entries(choice.effects)) {
    if (key.startsWith('_')) {
      // Generic type key — apply to all matching stakeholder types
      const typeName = key.slice(1) as string
      for (const stakeholder of scenario.stakeholders) {
        if (stakeholder.type === typeName) {
          updated[stakeholder.id] = Math.min(100, Math.max(0, (updated[stakeholder.id] ?? stakeholder.initial_relation) + delta))
        }
      }
    } else {
      // Specific stakeholder id
      if (updated[key] !== undefined) {
        updated[key] = Math.min(100, Math.max(0, updated[key] + delta))
      }
    }
  }

  return updated
}
