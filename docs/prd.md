# PRD — SalesXP
**Auteur : John (PM) · Version : 1.0 · Date : 2026-04-04**

---

## 1. Vision produit

> SalesXP transforme l'apprentissage commercial en aventure RPG — chaque deal est un niveau, chaque stakeholder un personnage, chaque mauvais choix une leçon.

**Objectif métier :** Permettre à un Sales ESN de progresser de la vente de régie simple vers la maîtrise des deals complexes multi-interlocuteurs, via la pratique répétée de scénarios réalistes gamifiés.

---

## 2. Personas

### Persona A — "Le Sales en Transition" (primaire)
- Sales ESN, 1-5 ans d'expérience, vend de la régie sur petits comptes
- Passage imminent sur grands comptes stratégiques
- Apprend mieux par la pratique que la théorie
- Veut des feedbacks concrets, pas du blabla

### Persona B — "Le Manager Commercial" (secondaire, V2)
- Responsable d'une équipe de Sales
- Veut suivre la progression de ses équipes
- Assigne des scénarios ciblés selon les gaps identifiés

---

## 3. Thématiques de deals

Chaque scénario appartient à une thématique métier ESN. Chaque thématique a ses propres stakeholders typiques, objections récurrentes et cycles de vente caractéristiques.

| Thématique | Description | Stakeholders clés | Cycle typique |
|------------|-------------|-------------------|---------------|
| **Apps** | Dev sur mesure, web/mobile, intégration | DSI, MOA, Chef de projet | 3-6 mois |
| **Infra** | Cloud, datacenter, réseau, virtualisation | DSI, RSSI, Responsable Infra | 4-9 mois |
| **DWP** | Digital Workplace, M365, Teams, collaboration | DRH, DSI, RSSI, utilisateurs | 3-6 mois |
| **Data** | BI, data engineering, analytics, IA | CDO, DSI, MOA Métier | 6-12 mois |
| **Cyber** | Audit sécu, SOC, RSSI as a service | RSSI, DSI, DG, DAF | 4-8 mois |
| **Cloud** | Migration cloud, DevOps, FinOps | DSI, Responsable Infra, DAF | 6-18 mois |
| **TMA** | Tierce maintenance applicative, MCO | DSI, Chef de projet, DAF | 12-36 mois |

---

## 4. Epics

| Epic | Titre |
|------|-------|
| E1 | Onboarding & Profil |
| E2 | Carte de Compte |
| E3 | Moteur de Scénarios |
| E4 | Feedback Pédagogique |
| E5 | XP & Progression |
| E6 | Récompenses & Badges |
| E7 | Bibliothèque de Scénarios |

---

## 5. User Stories

### E1 — Onboarding & Profil

**US-01 · Création de compte**
```
En tant que nouveau joueur
Je veux créer mon compte avec email/mot de passe
Afin d'accéder à mon espace personnel et sauvegarder ma progression

Critères d'acceptance :
- Formulaire : prénom, email, mot de passe (8 car. min)
- Email de confirmation envoyé
- Redirection vers l'onboarding après confirmation
- Erreur si email déjà utilisé
```

**US-02 · Tutoriel interactif**
```
En tant que nouveau joueur
Je veux suivre un tutoriel guidé sur mon premier mini-scénario
Afin de comprendre les mécaniques sans lire une doc

Critères d'acceptance :
- Tutoriel en 5 étapes maximum
- Chaque mécanique clé démontrée en contexte (jauge, action, feedback)
- Skippable après la première fois
- Récompense : badge "Premier Pas" + 50 XP
```

---

### E2 — Carte de Compte

**US-03 · Vue de la carte**
```
En tant que joueur en cours de scénario
Je veux voir une carte visuelle de mon compte avec tous les stakeholders
Afin de comprendre d'un coup d'œil l'état de mes relations

Critères d'acceptance :
- Chaque stakeholder affiché avec : nom, rôle, photo/avatar
- Jauge de relation visible (0-100, colorée : rouge/orange/vert)
- Indication du rôle dans la décision (décideur / influenceur / bloqueur)
- Clic sur un stakeholder → fiche détaillée
```

**US-04 · Fiche stakeholder**
```
En tant que joueur
Je veux consulter la fiche d'un stakeholder
Afin de préparer mes prochaines interactions avec lui

Critères d'acceptance :
- Motivations visibles dès le départ
- Peurs/freins débloqués au fil des interactions
- Historique des interactions passées
- Style de communication préféré (visible après 1ère interaction)
- Niveau d'influence dans la décision (1-5 étoiles)
```

**US-05 · Organigramme du compte**
```
En tant que joueur
Je veux voir l'organigramme hiérarchique des stakeholders
Afin de comprendre qui influence qui

Critères d'acceptance :
- Vue arbre avec liens hiérarchiques
- Liens d'influence informels indiqués
- Débloqués progressivement au fil des interactions
```

---

### E3 — Moteur de Scénarios

**US-06 · Démarrer un scénario**
```
En tant que joueur
Je veux démarrer un scénario depuis la bibliothèque
Afin de m'entraîner sur une thématique choisie

Critères d'acceptance :
- Briefing contextuel : compte fictif, enjeu commercial, contexte marché
- Présentation des premiers stakeholders connus
- Indication de la durée simulée (ex: "12 semaines simulées")
- Choix de la difficulté (normal / difficile) pour les scénarios déjà complétés
```

**US-07 · Actions hebdomadaires**
```
En tant que joueur
Je veux choisir mes 5 actions pour la semaine simulée
Afin de faire progresser mes relations et avancer le deal

Critères d'acceptance :
- 5 actions par semaine (budget fixe)
- Types d'actions disponibles selon le contexte :
  · Email de prise de contact
  · Demande de réunion
  · Déjeuner (coût : 2 actions)
  · Envoi d'une proposition
  · Organisation d'une visite de référence
  · Réponse à un événement imprévu
- Certaines actions débloquées selon la jauge de relation
- Confirmation avant validation de la semaine
```

**US-08 · Événements imprévus**
```
En tant que joueur
Je veux recevoir des événements imprévus pendant le scénario
Afin de tester ma réactivité face aux aléas commerciaux

Critères d'acceptance :
- 1 à 2 événements par scénario (aléatoires parmi une banque)
- Exemples : gel budgétaire, concurrent agressif, réorganisation interne
- Nécessite une réponse dans la semaine suivante
- Pas de bonne réponse universelle
```

**US-09 · Fin de scénario**
```
En tant que joueur
Je veux voir le résultat de mon scénario avec une analyse complète
Afin de comprendre ce qui a conduit au succès ou à l'échec

Critères d'acceptance :
- Résultat : Deal Gagné / Deal Perdu / Deal En Attente
- Score sur 100 avec décomposition (relations, timing, stratégie)
- Récapitulatif des 3 meilleures et 3 pires décisions
- XP gagnée + badges débloqués
- Bouton "Rejouer" disponible immédiatement
- Impact sur les scénarios suivants affiché
```

---

### E4 — Feedback Pédagogique

**US-10 · Feedback immédiat après action**
```
En tant que joueur
Je veux recevoir un feedback détaillé après chaque action
Afin de comprendre immédiatement l'impact et la logique commerciale

Critères d'acceptance :
- Résultat visible : variation de la jauge
- Explication en 2-3 phrases : pourquoi ça a marché / pas marché
- Conseil : ce qu'il aurait fallu faire
- Lien vers la compétence associée
- Ton pédagogique, pas condescendant
```

**US-11 · Analyse de fin de scénario**
```
En tant que joueur
Je veux une analyse détaillée de mon scénario complet
Afin d'identifier mes patterns d'erreurs

Critères d'acceptance :
- Timeline visuelle de toutes les actions (code couleur bonne/neutre/mauvaise)
- Chemin optimal comparé à mon parcours
- Top 3 des erreurs récurrentes
- Recommandation personnalisée de compétence à travailler
- Possible de revoir n'importe quelle décision et voir l'alternative
```

---

### E5 — XP & Progression

**US-12 · Gain d'XP**
```
En tant que joueur
Je veux gagner de l'XP à chaque action positive et fin de scénario
Afin de voir ma progression de façon tangible

Critères d'acceptance :
- XP gagnée : actions (1-10 pts), fin de scénario (50-200 pts selon score)
- Bonus XP : premier essai, score parfait, difficulté élevée
- Barre d'XP visible en permanence
- Animation de montée de niveau
```

**US-13 · Déblocage de scénarios**
```
En tant que joueur
Je veux débloquer de nouveaux scénarios en progressant
Afin de ressentir une progression narrative réelle

Critères d'acceptance :
- Scénarios verrouillés visibles avec condition de déblocage claire
- Notification à chaque déblocage
- Acte 2 débloqué après complétion des 3 scénarios de l'Acte 1
```

---

### E6 — Récompenses & Badges

**US-14 · Badges**
```
En tant que joueur
Je veux gagner des badges pour mes exploits
Afin d'être récompensé de mes performances spécifiques

Critères d'acceptance :
- Badges MVP (requis pour progression) et badges secrets
- Exemples : "Premier Champion Bâti", "Come-back King", "C-Level Opener"
- Chaque badge : icône + nom + description
- Visible sur le profil
```

**US-15 · Replay de scénario**
```
En tant que joueur
Je veux rejouer un scénario terminé
Afin d'améliorer mon score et tester une stratégie différente

Critères d'acceptance :
- Disponible immédiatement après la fin
- Choix de difficulté
- Historique des scores précédents visible
- XP réduite en replay, bonus si score supérieur
```

---

### E7 — Bibliothèque de Scénarios

**US-16 · Catalogue filtrable**
```
En tant que joueur
Je veux parcourir et filtrer les scénarios disponibles
Afin de choisir l'entraînement adapté à mon besoin

Critères d'acceptance :
- Filtres : Thématique, Acte, Difficulté, Statut
- Chaque carte : titre, thématique, durée estimée, difficulté, statut
- Scénarios verrouillés visibles avec condition de déblocage
```

---

## 6. Priorisation MoSCoW

### Must Have — MVP
| US | Description |
|----|-------------|
| US-01 | Création de compte |
| US-02 | Tutoriel interactif |
| US-03 | Carte de compte |
| US-04 | Fiche stakeholder |
| US-06 | Démarrer un scénario |
| US-07 | Actions hebdomadaires |
| US-09 | Fin de scénario |
| US-10 | Feedback immédiat |
| US-12 | Gain d'XP |
| US-13 | Déblocage de scénarios |
| US-16 | Catalogue filtrable |

### Should Have — V1
| US | Description |
|----|-------------|
| US-05 | Organigramme du compte |
| US-08 | Événements imprévus |
| US-11 | Analyse de fin de scénario |
| US-14 | Badges |
| US-15 | Replay de scénario |

### Could Have — V2
- Leaderboard entre joueurs
- Mode Manager (suivi d'équipe)
- Scénarios communautaires
- Mode défi (temps limité)

### Won't Have (scope actuel)
- Intégration CRM réel
- Coaching humain intégré
- Certification officielle

---

## 7. MVP — Définition

> Un Sales peut créer son compte, suivre le tutoriel, jouer un scénario complet de l'Acte 1, gérer 5 stakeholders sur la carte de compte, recevoir un feedback détaillé à chaque action, terminer le scénario, gagner de l'XP, et pouvoir le rejouer immédiatement.

**Scénarios MVP (Acte 1) :**

| ID | Titre | Thématique | Difficulté | Stakeholders |
|----|-------|------------|------------|--------------|
| ACT1-S1 | Premier Contact | Apps | Facile | 5 |
| ACT1-S2 | Renouvellement Défensif | DWP | Facile | 5 |
| ACT1-S3 | Montée en Gamme | Apps | Moyen | 6 |
