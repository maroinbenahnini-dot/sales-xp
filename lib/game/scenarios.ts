import fs from 'fs'
import path from 'path'
import type { Scenario, ScenarioTheme, ScenarioDifficulty } from '@/types/game'

const SCENARIOS_DIR = path.join(process.cwd(), 'content', 'scenarios')

export function getAllScenarios(): Scenario[] {
  const files = fs.readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.json'))
  return files.map(file => {
    const raw = fs.readFileSync(path.join(SCENARIOS_DIR, file), 'utf-8')
    return JSON.parse(raw) as Scenario
  })
}

export function getScenario(id: string): Scenario | null {
  try {
    const raw = fs.readFileSync(
      path.join(SCENARIOS_DIR, `${id.toLowerCase()}.json`),
      'utf-8'
    )
    return JSON.parse(raw) as Scenario
  } catch {
    return null
  }
}

export type ScenarioFilter = {
  theme?: ScenarioTheme
  act?: 1 | 2 | 3
  difficulty?: ScenarioDifficulty
}

export function filterScenarios(scenarios: Scenario[], filter: ScenarioFilter): Scenario[] {
  return scenarios.filter(s => {
    if (filter.theme && s.theme !== filter.theme) return false
    if (filter.act && s.act !== filter.act) return false
    if (filter.difficulty && s.difficulty !== filter.difficulty) return false
    return true
  })
}
