'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Rfp, RfpRunState, TeamMember, RfpTask } from '@/types/game'

// ─── Step types ───────────────────────────────────────────────────────────────
type Step = 'analyse' | 'equipe' | 'taches' | 'prix' | 'bilan'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'analyse', label: 'Exigences', icon: '📋' },
  { id: 'equipe',  label: 'Équipe',    icon: '👥' },
  { id: 'taches',  label: 'Tâches',    icon: '🗂️' },
  { id: 'prix',    label: 'Pricing',   icon: '💰' },
  { id: 'bilan',   label: 'Bilan',     icon: '🏁' },
]

interface ScoreBreakdown {
  coverage: number
  team: number
  price: number
  total: number
}

interface Props {
  rfp: Rfp
  runId: string
  initialState: RfpRunState
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function memberHasSkills(member: TeamMember, required: string[]) {
  return required.every(s => member.skills.includes(s))
}

function availabilityLabel(v: number) {
  if (v >= 0.9) return { text: '100%', color: 'text-green-400' }
  if (v >= 0.7) return { text: `${Math.round(v * 100)}%`, color: 'text-yellow-400' }
  return { text: `${Math.round(v * 100)}%`, color: 'text-red-400' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepAnalyse({ rfp }: { rfp: Rfp }) {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setHighlighted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">{rfp.context}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Clique sur les exigences clés pour les mettre en évidence — cela t&apos;aidera à constituer l&apos;équipe.
      </p>
      <div className="space-y-3">
        {rfp.requirements.map(req => (
          <button
            key={req.id}
            onClick={() => toggle(req.id)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              highlighted.has(req.id)
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">{req.section}</p>
                <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                {req.weight}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepEquipe({
  rfp, selected, onToggle,
}: {
  rfp: Rfp
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sélectionne entre 3 et 5 consultants. Assure-toi de couvrir toutes les compétences requises.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rfp.team_pool.map(member => {
          const isSelected = selected.includes(member.id)
          const avail = availabilityLabel(member.availability)
          return (
            <button
              key={member.id}
              onClick={() => onToggle(member.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{member.name}</p>
                {isSelected && <span className="text-xs text-primary font-medium">✓ Sélectionné</span>}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {member.skills.map(s => (
                  <span key={s} className="text-xs rounded px-1.5 py-0.5 bg-muted border border-border font-mono">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={avail.color}>Dispo : {avail.text}</span>
                <span className="text-muted-foreground">{member.cost_per_day} €/j</span>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground pt-1">
        {selected.length} / 5 consultant{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}

function StepTaches({
  rfp, selectedMemberIds, assignments, onAssign,
}: {
  rfp: Rfp
  selectedMemberIds: string[]
  assignments: Record<string, string>
  onAssign: (taskId: string, memberId: string) => void
}) {
  const selectedMembers = rfp.team_pool.filter(m => selectedMemberIds.includes(m.id))

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Assigne chaque tâche à un consultant. Les compétences requises sont indiquées en rouge si non couvertes.
      </p>
      <div className="space-y-3">
        {rfp.tasks.map(task => {
          const assignedId = assignments[task.id]
          const assignedMember = rfp.team_pool.find(m => m.id === assignedId)
          const isQualified = assignedMember ? memberHasSkills(assignedMember, task.required_skills) : false

          return (
            <div key={task.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.section} · {task.duration_days}j · impact {task.quality_impact}%</p>
                </div>
                {assignedId && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isQualified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isQualified ? '✓ Qualifié' : '⚠ Hors profil'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {task.required_skills.map(s => {
                  const covered = assignedMember?.skills.includes(s)
                  return (
                    <span
                      key={s}
                      className={`text-xs rounded px-1.5 py-0.5 border font-mono ${
                        covered ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                      }`}
                    >
                      {s}
                    </span>
                  )
                })}
              </div>
              <select
                value={assignedId ?? ''}
                onChange={e => onAssign(task.id, e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Choisir un consultant —</option>
                {selectedMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepPrix({
  rfp, rate, onRate,
}: {
  rfp: Rfp
  rate: number
  onRate: (v: number) => void
}) {
  const { market_rate, aggressive_threshold, premium_threshold, competitor_estimate } = rfp.pricing_strategy

  function priceSignal(): { label: string; color: string; advice: string } {
    if (rate < aggressive_threshold)
      return { label: 'Trop bas', color: 'text-red-400', advice: 'Risque de perte de marge et de crédibilité.' }
    if (rate > premium_threshold)
      return { label: 'Trop élevé', color: 'text-red-400', advice: 'Hors budget client, concurrents plus attractifs.' }
    if (rate <= competitor_estimate)
      return { label: 'Compétitif', color: 'text-green-400', advice: 'Bon positionnement face à la concurrence.' }
    return { label: 'Légèrement au-dessus', color: 'text-yellow-400', advice: 'Justifie ta valeur ajoutée par rapport aux concurrents.' }
  }

  const signal = priceSignal()
  const min = Math.round(aggressive_threshold * 0.8)
  const max = Math.round(premium_threshold * 1.2)

  // Position markers as % of slider range
  function pct(v: number) { return Math.round(((v - min) / (max - min)) * 100) }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Tarif journalier moyen</p>
          <p className="text-2xl font-bold tabular-nums">{rate} <span className="text-base text-muted-foreground">€/j</span></p>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={rate}
          onChange={e => onRate(Number(e.target.value))}
          className="w-full accent-primary"
        />
        {/* Markers */}
        <div className="relative h-5 text-xs text-muted-foreground">
          <span className="absolute" style={{ left: `${pct(aggressive_threshold)}%` }}>▲</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${pct(market_rate)}%` }}>
            <span className="text-primary">Marché</span>
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${pct(competitor_estimate)}%` }}>Concu.</span>
        </div>
      </div>

      <div className={`rounded-xl border p-4 space-y-1 ${signal.color === 'text-green-400' ? 'border-green-500/40 bg-green-500/5' : signal.color === 'text-yellow-400' ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
        <p className={`font-semibold ${signal.color}`}>{signal.label}</p>
        <p className="text-sm text-muted-foreground">{signal.advice}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        {[
          { label: 'Taux marché', value: market_rate },
          { label: 'Concurrent', value: competitor_estimate },
          { label: 'Ton tarif', value: rate, highlight: true },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-3 ${item.highlight ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepBilan({
  rfp, breakdown, result, xpEarned, onReplay, onLibrary,
}: {
  rfp: Rfp
  breakdown: ScoreBreakdown | null
  result: 'won' | 'lost' | null
  xpEarned: number
  onReplay: () => void
  onLibrary: () => void
}) {
  if (!breakdown || !result) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Soumission en cours…</p>
      </div>
    )
  }

  const scoreItems = [
    { label: 'Couverture des tâches', value: breakdown.coverage, weight: '40%', icon: '🗂️' },
    { label: 'Qualité de l\'équipe', value: breakdown.team, weight: '30%', icon: '👥' },
    { label: 'Compétitivité du prix', value: breakdown.price, weight: '30%', icon: '💰' },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl">{result === 'won' ? '🏆' : '😤'}</div>
        <h2 className="text-2xl font-bold">{result === 'won' ? 'Offre retenue !' : 'Offre non retenue'}</h2>
        <p className="text-4xl font-bold tabular-nums">
          {breakdown.total}<span className="text-lg text-muted-foreground">/100</span>
        </p>
        {xpEarned > 0 && (
          <p className="text-primary font-semibold text-lg">+{xpEarned} XP</p>
        )}
      </div>

      <div className="space-y-3">
        {scoreItems.map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <p className="text-sm font-medium">{item.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">(poids {item.weight})</span>
                <span className={`text-sm font-bold ${item.value >= 70 ? 'text-green-400' : item.value >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {item.value}/100
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${item.value >= 70 ? 'bg-green-500' : item.value >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {result === 'won' ? (
          <p>
            Félicitations ! RetailGroup SA a retenu ton offre. Ton architecture cloud est solide, l&apos;équipe est bien calibrée et le prix est compétitif.
            {breakdown.price < 60 && ' Attention au pricing : tu as laissé de la marge sur la table.'}
            {breakdown.coverage < 70 && ' Quelques tâches étaient mal couvertes — à améliorer pour la prochaine AO.'}
          </p>
        ) : (
          <p>
            L&apos;offre n&apos;a pas été retenue.
            {breakdown.coverage < 70 && ' La couverture des tâches était insuffisante : assure-toi d\'assigner des consultants qualifiés.'}
            {breakdown.team < 60 && ' La disponibilité de l\'équipe était trop faible.'}
            {breakdown.price < 50 && ' Ton tarif était hors cible.'}
            {' '}Rejoue pour améliorer ta stratégie.
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onLibrary}
          className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          Bibliothèque
        </button>
        <button
          onClick={onReplay}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          Rejouer
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RfpPlayer({ rfp, runId, initialState }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('analyse')
  const [teamSelected, setTeamSelected] = useState<string[]>(initialState.team_selected ?? [])
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>(initialState.task_assignments ?? {})
  const [dailyRate, setDailyRate] = useState<number>(
    initialState.daily_rate_chosen || rfp.pricing_strategy.market_rate
  )
  const [submitting, setSubmitting] = useState(false)
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null)
  const [result, setResult] = useState<'won' | 'lost' | null>(null)
  const [xpEarned, setXpEarned] = useState(0)

  const currentStepIndex = STEPS.findIndex(s => s.id === step)

  function toggleMember(id: string) {
    setTeamSelected(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : prev.length < 5 ? [...prev, id] : prev
    )
  }

  function assignTask(taskId: string, memberId: string) {
    setTaskAssignments(prev => ({ ...prev, [taskId]: memberId }))
  }

  function canAdvance(): boolean {
    if (step === 'equipe') return teamSelected.length >= 3
    if (step === 'taches') return rfp.tasks.every(t => taskAssignments[t.id])
    return true
  }

  function goNext() {
    const idx = STEPS.findIndex(s => s.id === step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id)
  }

  function goPrev() {
    const idx = STEPS.findIndex(s => s.id === step)
    if (idx > 0) setStep(STEPS[idx - 1].id)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setStep('bilan')

    const state: RfpRunState = {
      team_selected: teamSelected,
      task_assignments: taskAssignments,
      daily_rate_chosen: dailyRate,
      days_remaining: rfp.deadline_days,
      sections_completed: rfp.requirements.map(r => r.id),
    }

    const res = await fetch(`/api/rfp/${rfp.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run_id: runId, state }),
    })

    if (res.ok) {
      const data = await res.json()
      setBreakdown(data.breakdown)
      setResult(data.result)
      setXpEarned(data.xp_earned)
    }
    setSubmitting(false)
  }

  function handleReplay() {
    router.refresh()
    setStep('analyse')
    setTeamSelected([])
    setTaskAssignments({})
    setDailyRate(rfp.pricing_strategy.market_rate)
    setBreakdown(null)
    setResult(null)
    setXpEarned(0)
  }

  const isPrixStep = step === 'prix'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Appel d&apos;Offre</p>
            <h2 className="font-semibold text-lg">{rfp.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{rfp.client}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">{rfp.deal_size}</p>
            <p className="text-xs text-muted-foreground">{rfp.deadline_days}j deadline</p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isDone = i < currentStepIndex
          const isCurrent = s.id === step
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center flex-1 ${isCurrent ? 'opacity-100' : isDone ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-colors ${
                  isDone ? 'bg-primary/20 text-primary' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {isDone ? '✓' : s.icon}
                </div>
                <p className="text-xs mt-1 text-muted-foreground hidden sm:block">{s.label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 transition-colors ${isDone ? 'bg-primary/40' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'analyse' && <StepAnalyse rfp={rfp} />}
          {step === 'equipe' && (
            <StepEquipe rfp={rfp} selected={teamSelected} onToggle={toggleMember} />
          )}
          {step === 'taches' && (
            <StepTaches
              rfp={rfp}
              selectedMemberIds={teamSelected}
              assignments={taskAssignments}
              onAssign={assignTask}
            />
          )}
          {step === 'prix' && (
            <StepPrix rfp={rfp} rate={dailyRate} onRate={setDailyRate} />
          )}
          {step === 'bilan' && (
            <StepBilan
              rfp={rfp}
              breakdown={breakdown}
              result={result}
              xpEarned={xpEarned}
              onReplay={handleReplay}
              onLibrary={() => router.push('/library')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step !== 'bilan' && (
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <button
              onClick={goPrev}
              className="px-5 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              ← Retour
            </button>
          )}
          <div className="flex-1" />
          {isPrixStep ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Envoi…' : 'Soumettre l\'offre →'}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Suivant →
            </button>
          )}
        </div>
      )}

      {/* Validation hints */}
      {step === 'equipe' && teamSelected.length < 3 && (
        <p className="text-xs text-center text-muted-foreground">
          Sélectionne au moins 3 consultants pour continuer.
        </p>
      )}
      {step === 'taches' && !rfp.tasks.every(t => taskAssignments[t.id]) && (
        <p className="text-xs text-center text-muted-foreground">
          Assigne tous les {rfp.tasks.length} tâches pour continuer.
        </p>
      )}
    </div>
  )
}
