# BMAD-METHOD — SalesXP

Ce dossier contient les agents BMAD pour piloter le développement du projet.

## Agents disponibles

| Agent | Persona | Rôle | Commande |
|-------|---------|------|----------|
| Analyst | Mary | Brainstorming, brief produit, recherche | "parle à Mary" |
| PM | John | PRD, epics, user stories, priorisation | "parle à John" |
| Architect | Winston | Architecture technique, schéma BDD, stack | "parle à Winston" |

## Workflow recommandé

```
1. Mary (Analyst)   → Project Brief + Brainstorming
       ↓
2. John (PM)        → PRD + Epics + User Stories
       ↓
3. Winston (Arch.)  → Architecture + Schéma BDD
       ↓
4. Dev              → Implémentation Next.js + Supabase
```

## Documents produits (dans /docs)

- `project-brief.md` — Vision produit (produit par Mary)
- `prd.md` — Product Requirements Document (produit par John)
- `architecture.md` — Architecture technique (produit par Winston)

## Config

Voir `bmm/config.yaml` pour la configuration du projet.
