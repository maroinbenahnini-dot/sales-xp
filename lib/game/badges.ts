import type { Badge } from '@/types/game'

export const BADGES_CATALOG: Omit<Badge, 'earned_at'>[] = [
  // ── Premières fois ──────────────────────────────────────────────────────────
  {
    key: 'first_win',
    name: 'Premier Deal',
    description: 'Remporte ton premier scénario.',
    icon: '🏆',
  },
  {
    key: 'first_rfp',
    name: 'Première AO',
    description: 'Soumets ta première réponse à un appel d\'offre.',
    icon: '📝',
  },
  {
    key: 'rfp_winner',
    name: 'AO Retenue',
    description: 'Remporte un appel d\'offre.',
    icon: '🥇',
  },

  // ── Thèmes ──────────────────────────────────────────────────────────────────
  {
    key: 'cloud_expert',
    name: 'Cloud Expert',
    description: 'Remporte un deal ou une AO sur le thème Cloud.',
    icon: '☁️',
  },
  {
    key: 'cyber_guardian',
    name: 'Cyber Guardian',
    description: 'Remporte un deal sur le thème Cyber.',
    icon: '🛡️',
  },
  {
    key: 'data_wizard',
    name: 'Data Wizard',
    description: 'Remporte un deal sur le thème Data.',
    icon: '📊',
  },
  {
    key: 'apps_builder',
    name: 'Apps Builder',
    description: 'Remporte un deal sur le thème Apps.',
    icon: '📱',
  },
  {
    key: 'infra_master',
    name: 'Infra Master',
    description: 'Remporte un deal sur le thème Infra.',
    icon: '🖥️',
  },

  // ── Performance ─────────────────────────────────────────────────────────────
  {
    key: 'perfect_score',
    name: 'Score Parfait',
    description: 'Obtiens 95/100 ou plus sur un scénario.',
    icon: '💯',
  },
  {
    key: 'speed_closer',
    name: 'Speed Closer',
    description: 'Gagne un deal en moins de 4 semaines.',
    icon: '⚡',
  },
  {
    key: 'all_champions',
    name: 'Champion Builder',
    description: 'Transforme tous les stakeholders en champions dans un scénario.',
    icon: '🌟',
  },

  // ── Progression ─────────────────────────────────────────────────────────────
  {
    key: 'level_3',
    name: 'Sales Confirmé',
    description: 'Atteins le niveau 3.',
    icon: '🎯',
  },
  {
    key: 'level_5',
    name: 'Senior Account Manager',
    description: 'Atteins le niveau 5.',
    icon: '🚀',
  },
  {
    key: 'five_wins',
    name: 'Série de 5',
    description: 'Remporte 5 deals au total.',
    icon: '🔥',
  },
  {
    key: 'ten_wins',
    name: 'Deal Machine',
    description: 'Remporte 10 deals au total.',
    icon: '💎',
  },
]

export function getBadge(key: string): Omit<Badge, 'earned_at'> | undefined {
  return BADGES_CATALOG.find(b => b.key === key)
}

export function enrichBadges(
  earnedKeys: Array<{ badge_key: string; earned_at: string }>
): Badge[] {
  return BADGES_CATALOG.map(badge => {
    const earned = earnedKeys.find(e => e.badge_key === badge.key)
    return { ...badge, earned_at: earned?.earned_at }
  })
}
