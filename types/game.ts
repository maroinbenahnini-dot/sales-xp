// ─── Stakeholder ──────────────────────────────────────────────────────────────

export type StakeholderType = 'decision_maker' | 'influencer' | 'blocker' | 'champion'

export interface Stakeholder {
  id: string
  name: string
  role: string
  influence: number // 1-5
  type: StakeholderType
  visible_motivation: string
  hidden_fear: string
  preferred_channel: 'email' | 'meeting' | 'lunch' | 'demo'
  initial_relation: number // 0-100
  avatar_url?: string
}

// ─── Action ───────────────────────────────────────────────────────────────────

export type ActionType = 'email' | 'meeting_request' | 'lunch' | 'proposal' | 'reference_visit' | 'event_response'

export interface ActionChoice {
  id: string
  label: string
  effects: Record<string, number> // stakeholder_id → relation delta
  feedback: {
    result: string
    explanation: string
    optimal: string
    skill: string
  }
}

export interface Action {
  cost: number
  choices: ActionChoice[]
}

// ─── Scenario ─────────────────────────────────────────────────────────────────

export type ScenarioTheme = 'apps' | 'infra' | 'dwp' | 'data' | 'cyber' | 'cloud' | 'tma'
export type ScenarioDifficulty = 'easy' | 'medium' | 'hard'
export type ScenarioStatus = 'locked' | 'available' | 'in_progress' | 'won' | 'lost'

export interface ScenarioContext {
  company: string
  industry: string
  deal_size: string
  brief: string
}

export interface ScenarioEnding {
  condition: string
  narrative: string
  xp: number
  badges: string[]
  carry_over: Record<string, string>
}

export interface Scenario {
  id: string
  title: string
  act: 1 | 2 | 3
  theme: ScenarioTheme
  difficulty: ScenarioDifficulty
  duration_weeks: number
  actions_per_week: number
  context: ScenarioContext
  stakeholders: Stakeholder[]
  actions: Record<ActionType, Action>
  endings: {
    won: ScenarioEnding
    lost: ScenarioEnding
    pending?: ScenarioEnding
  }
}

// ─── Scenario Run State ───────────────────────────────────────────────────────

export interface StakeholderState {
  relation: number // 0-100
  is_champion: boolean
  discovered_fears: string[]
  interaction_count: number
}

export interface ScenarioRunState {
  stakeholders: Record<string, StakeholderState>
  actions_history: Array<{
    week: number
    action_type: ActionType
    choice_id: string
    effects: Record<string, number>
  }>
  events_triggered: string[]
  carry_over_applied: Record<string, string>
}

// ─── RFP ──────────────────────────────────────────────────────────────────────

export interface RfpRequirement {
  id: string
  section: string
  description: string
  weight: number // percentage, sum = 100
}

export interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  availability: number // 0-1
  cost_per_day: number
}

export interface RfpTask {
  id: string
  title: string
  section: string
  required_skills: string[]
  duration_days: number
  quality_impact: number
  assigned_to?: string // TeamMember id
}

export interface PricingStrategy {
  market_rate: number
  aggressive_threshold: number
  premium_threshold: number
  competitor_estimate: number
}

export interface Rfp {
  id: string
  title: string
  theme: ScenarioTheme
  difficulty: ScenarioDifficulty
  deadline_days: number
  deal_size: string
  client: string
  context: string
  requirements: RfpRequirement[]
  team_pool: TeamMember[]
  tasks: RfpTask[]
  pricing_strategy: PricingStrategy
  endings: {
    won: { condition: string; xp: number; badges: string[] }
    lost: { condition: string; xp: number; badges: string[] }
  }
}

export interface RfpRunState {
  team_selected: string[] // TeamMember ids
  task_assignments: Record<string, string> // task_id → member_id
  daily_rate_chosen: number
  days_remaining: number
  sections_completed: string[]
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url?: string
  level: number
  xp_total: number
  reputation: number
  created_at: string
}

export interface Badge {
  key: string
  name: string
  description: string
  icon: string
  earned_at?: string
}

// ─── XP & Levels ─────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, title: 'Stagiaire Commercial', xp_required: 0 },
  { level: 2, title: 'Junior Sales', xp_required: 500 },
  { level: 3, title: 'Sales Confirmé', xp_required: 1500 },
  { level: 4, title: 'Account Manager', xp_required: 3500 },
  { level: 5, title: 'Senior Account Manager', xp_required: 7000 },
  { level: 6, title: 'Key Account Manager', xp_required: 12000 },
  { level: 7, title: 'Strategic Account Director', xp_required: 20000 },
] as const

export function getLevelFromXp(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.xp_required) ?? LEVELS[0]
}

export function getNextLevel(currentLevel: number) {
  return LEVELS.find(l => l.level === currentLevel + 1) ?? null
}
