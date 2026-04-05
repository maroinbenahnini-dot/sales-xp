import { create } from 'zustand'
import { Scenario, ScenarioRunState, ActionType, ActionChoice } from '@/types/game'

interface ScenarioStore {
  scenario: Scenario | null
  runId: string | null
  currentWeek: number
  actionsRemaining: number
  state: ScenarioRunState | null
  lastFeedback: ActionChoice['feedback'] | null

  initScenario: (scenario: Scenario, runId: string, state: ScenarioRunState, week: number) => void
  applyActionResult: (effects: Record<string, number>, feedback: ActionChoice['feedback']) => void
  consumeAction: (cost: number) => void
  advanceWeek: () => void
  clearFeedback: () => void
  reset: () => void
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  scenario: null,
  runId: null,
  currentWeek: 1,
  actionsRemaining: 5,
  state: null,
  lastFeedback: null,

  initScenario: (scenario, runId, state, week) => set({
    scenario,
    runId,
    currentWeek: week,
    actionsRemaining: scenario.actions_per_week,
    state,
    lastFeedback: null,
  }),

  applyActionResult: (effects, feedback) => set((s) => {
    if (!s.state) return s
    const updated = { ...s.state }
    Object.entries(effects).forEach(([stakeholderId, delta]) => {
      const current = updated.stakeholders[stakeholderId]
      if (!current) return
      updated.stakeholders[stakeholderId] = {
        ...current,
        relation: Math.min(100, Math.max(0, current.relation + delta)),
      }
    })
    return { state: updated, lastFeedback: feedback }
  }),

  consumeAction: (cost) => set((s) => ({
    actionsRemaining: Math.max(0, s.actionsRemaining - cost),
  })),

  advanceWeek: () => set((s) => ({
    currentWeek: s.currentWeek + 1,
    actionsRemaining: s.scenario?.actions_per_week ?? 5,
  })),

  clearFeedback: () => set({ lastFeedback: null }),

  reset: () => set({
    scenario: null,
    runId: null,
    currentWeek: 1,
    actionsRemaining: 5,
    state: null,
    lastFeedback: null,
  }),
}))
