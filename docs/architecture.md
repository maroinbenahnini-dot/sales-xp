# Architecture Technique — SalesXP
**Auteur : Winston (Architect) · Version : 1.0 · Date : 2026-04-05**

---

## 1. Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR natif, routing file-based, écosystème solide |
| **UI** | Tailwind CSS + shadcn/ui | Composants accessibles, pas de sur-engineering |
| **State client** | Zustand | Léger, simple, suffisant pour l'état de jeu |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) | BDD + Auth + API en un seul service managé |
| **Scénarios** | Fichiers JSON dans `/content/scenarios/` | Versionné, lisible, pas de back-office MVP |
| **Déploiement** | Vercel (frontend) + Supabase Cloud | Zero-ops, scalable automatiquement |
| **Animations** | Framer Motion | Indispensable pour l'expérience jeu (XP, badges) |

---

## 2. Schéma de base de données

### Table `users`
```sql
users
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
  email       text UNIQUE NOT NULL
  username    text NOT NULL
  avatar_url  text
  level       int DEFAULT 1
  xp_total    int DEFAULT 0
  reputation  int DEFAULT 50
  created_at  timestamptz DEFAULT now()
```

### Table `user_skills`
```sql
user_skills
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE
  skill_key   text NOT NULL
  level       int DEFAULT 0          -- 0-5
  updated_at  timestamptz DEFAULT now()

UNIQUE(user_id, skill_key)
```

### Table `scenario_runs`
```sql
scenario_runs
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE
  scenario_id     text NOT NULL
  status          text NOT NULL      -- 'in_progress' | 'won' | 'lost' | 'pending'
  score           int
  xp_earned       int DEFAULT 0
  current_week    int DEFAULT 1
  state           jsonb NOT NULL     -- état complet du jeu (jauges, flags, historique)
  started_at      timestamptz DEFAULT now()
  completed_at    timestamptz
```

### Table `user_badges`
```sql
user_badges
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE
  badge_key   text NOT NULL
  earned_at   timestamptz DEFAULT now()

UNIQUE(user_id, badge_key)
```

### Table `rfp_runs`
```sql
rfp_runs
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE
  rfp_id          text NOT NULL
  status          text NOT NULL      -- 'in_progress' | 'submitted' | 'won' | 'lost'
  score           int
  xp_earned       int DEFAULT 0
  state           jsonb NOT NULL     -- équipe, tâches assignées, sections complétées
  started_at      timestamptz DEFAULT now()
  submitted_at    timestamptz
  completed_at    timestamptz
```

> **Choix clé :** L'état complet du jeu est stocké en `jsonb` dans `state`. Cela évite des dizaines de tables relationnelles pour le MVP et reste queryable via PostgreSQL.

---

## 3. Structure des fichiers de contenu

### Scénario classique (`/content/scenarios/act1-s1.json`)
```json
{
  "id": "ACT1-S1",
  "title": "Premier Contact",
  "act": 1,
  "theme": "apps",
  "difficulty": "easy",
  "duration_weeks": 12,
  "actions_per_week": 5,
  "context": {
    "company": "FinTech SA",
    "industry": "Banque & Assurance",
    "deal_size": "150k€",
    "brief": "FinTech SA cherche un partenaire pour refondre son application mobile client..."
  },
  "stakeholders": [
    {
      "id": "marc_d",
      "name": "Marc Dubois",
      "role": "DSI",
      "influence": 5,
      "type": "decision_maker",
      "visible_motivation": "Réduire la dette technique",
      "hidden_fear": "Peur de perdre le contrôle du SI",
      "preferred_channel": "meeting",
      "initial_relation": 10
    }
  ],
  "actions": {
    "email": {
      "cost": 1,
      "choices": [
        {
          "id": "email_formal",
          "label": "Email formel de présentation",
          "effects": { "marc_d": 8 },
          "feedback": {
            "result": "Marc apprécie le professionnalisme.",
            "explanation": "Dans un premier contact DSI, la formalité rassure. Marc est process-driven.",
            "optimal": "C'était le bon choix.",
            "skill": "first_contact"
          }
        }
      ]
    }
  },
  "endings": {
    "won": {
      "condition": "score >= 70",
      "narrative": "FinTech SA signe.",
      "xp": 200,
      "badges": ["first_win"],
      "carry_over": { "marc_d_relation": "positive", "fintech_reputation": "strong" }
    },
    "lost": {
      "condition": "score < 40",
      "narrative": "FinTech SA choisit un concurrent.",
      "xp": 50,
      "badges": [],
      "carry_over": { "fintech_reputation": "damaged" }
    }
  }
}
```

### AO (`/content/rfp/rfp-ao1.json`)
```json
{
  "id": "AO1",
  "title": "AO — Modernisation du SI RH",
  "theme": "apps",
  "difficulty": "medium",
  "deadline_days": 21,
  "deal_size": "800k€",
  "client": "Groupe Industriel Marteau",
  "context": "Le groupe Marteau lance un AO pour moderniser son SI RH sur 3 ans...",
  "requirements": [
    { "id": "req1", "section": "Technique", "description": "Expertise Java / Spring Boot", "weight": 30 },
    { "id": "req2", "section": "Méthodologie", "description": "Approche Agile documentée", "weight": 25 },
    { "id": "req3", "section": "Références", "description": "3 références industrie similaire", "weight": 20 },
    { "id": "req4", "section": "Prix", "description": "Grille tarifaire détaillée", "weight": 25 }
  ],
  "team_pool": [
    {
      "id": "alice",
      "name": "Alice Martin",
      "role": "Architecte Java Senior",
      "skills": ["java", "spring", "architecture"],
      "availability": 0.8,
      "cost_per_day": 850
    }
  ],
  "tasks": [
    {
      "id": "task_exec_summary",
      "title": "Rédiger le résumé exécutif",
      "section": "req1",
      "required_skills": ["architecture"],
      "duration_days": 3,
      "quality_impact": 15
    }
  ],
  "pricing_strategy": {
    "market_rate": 750,
    "aggressive_threshold": 650,
    "premium_threshold": 900,
    "competitor_estimate": 720
  },
  "endings": {
    "won": { "condition": "score >= 75", "xp": 400, "badges": ["first_ao_win"] },
    "lost": { "condition": "score < 50", "xp": 80, "badges": [] }
  }
}
```

---

## 4. Structure des routes Next.js

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (game)/
│   ├── layout.tsx              -- Layout principal avec barre XP
│   ├── dashboard/page.tsx      -- Hub : profil, progression, accès rapide
│   ├── library/page.tsx        -- Bibliothèque scénarios + AO filtrables
│   │
│   ├── scenario/[id]/
│   │   ├── page.tsx
│   │   ├── account-map/page.tsx
│   │   ├── actions/page.tsx
│   │   └── debrief/page.tsx
│   │
│   └── rfp/[id]/
│       ├── page.tsx
│       ├── requirements/page.tsx
│       ├── team/page.tsx
│       ├── tasks/page.tsx
│       ├── pricing/page.tsx
│       └── debrief/page.tsx
│
└── api/
    ├── scenario/[id]/action/route.ts
    ├── scenario/[id]/advance/route.ts
    ├── rfp/[id]/assign/route.ts
    └── rfp/[id]/submit/route.ts
```

---

## 5. Flux de données — Mode Scénario

```
[Client] Joueur choisit une action
    │
    ▼
[API] POST /api/scenario/[id]/action
    │  ├── Vérifie le budget actions restant
    │  ├── Charge le JSON du scénario (server-side)
    │  ├── Calcule les effets (variation jauges)
    │  ├── Génère le feedback pédagogique
    │  └── Met à jour scenario_runs.state
    │
    ▼
[Client] Affiche feedback + animation jauge
    │
    ▼
[API] POST /api/scenario/[id]/advance
    │  ├── Déclenche événements aléatoires
    │  ├── Vérifie conditions de fin
    │  └── Met à jour current_week
```

---

## 6. Flux de données — Mode AO

```
[Client] Joueur analyse le cahier des charges
    │
    ▼
[Client] Constitue son équipe (drag & drop sur les tâches)
    │
    ▼
[API] POST /api/rfp/[id]/assign
    │  ├── Vérifie compétences vs tâche
    │  ├── Calcule qualité (skills match × disponibilité)
    │  └── Met à jour rfp_runs.state
    │
    ▼
[Client] Choisit stratégie de prix (curseur)
    │
    ▼
[API] POST /api/rfp/[id]/submit
    │  ├── Calcule score total (qualité × prix × délai)
    │  ├── Compare aux critères pondérés
    │  ├── Détermine résultat (gagné/perdu)
    │  └── Attribue XP + badges
```

---

## 7. Sécurité

| Couche | Mécanisme |
|--------|-----------|
| Auth | Supabase Auth (JWT) — email/password MVP |
| RLS | Row Level Security sur toutes les tables `user_*` |
| API | Middleware Next.js vérifie le JWT sur toutes les routes game |
| Scénarios | Fichiers JSON lus server-side uniquement, jamais exposés |

---

## 8. Décisions architecturales

| Décision | Choix | Raison |
|----------|-------|--------|
| État de jeu | `jsonb` dans `state` | Évite 10 tables, flexible pour l'évolution des scénarios |
| Scénarios | Fichiers JSON versionnés | Simple, pas de back-office, modifiable sans BDD |
| State management | Zustand | Suffisant, pas de Redux over-engineering |
| Animations | Framer Motion | Indispensable pour l'immersion jeu |
| AO engine | Même pattern JSON que les scénarios | DRY — un seul moteur de lecture de contenu |
