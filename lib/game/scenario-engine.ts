import { Scenario, ScenarioRunState, ActionType, StakeholderState } from '@/types/game'

export function buildInitialState(scenario: Scenario): ScenarioRunState {
  const stakeholders: Record<string, StakeholderState> = {}

  scenario.stakeholders.forEach((s) => {
    stakeholders[s.id] = {
      relation: s.initial_relation,
      is_champion: false,
      discovered_fears: [],
      interaction_count: 0,
    }
  })

  return {
    stakeholders,
    actions_history: [],
    events_triggered: [],
    carry_over_applied: {},
  }
}

export function computeScore(scenario: Scenario, state: ScenarioRunState): number {
  const stakeholders = scenario.stakeholders
  let weightedRelation = 0
  let totalWeight = 0

  stakeholders.forEach((s) => {
    const current = state.stakeholders[s.id]
    if (!current) return
    weightedRelation += current.relation * s.influence
    totalWeight += s.influence
  })

  const relationScore = totalWeight > 0 ? (weightedRelation / totalWeight) : 0
  const championBonus = Object.values(state.stakeholders).filter(s => s.is_champion).length * 5

  return Math.min(100, Math.round(relationScore + championBonus))
}

export function checkChampionThreshold(relation: number): boolean {
  return relation >= 75
}

export function resolveEnding(scenario: Scenario, score: number): 'won' | 'lost' | 'pending' {
  if (score >= 70) return 'won'
  if (score < 40) return 'lost'
  return 'pending'
}
