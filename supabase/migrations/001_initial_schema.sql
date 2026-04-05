-- ============================================================
-- SalesXP — Schéma initial
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  username    text NOT NULL,
  avatar_url  text,
  level       int NOT NULL DEFAULT 1,
  xp_total    int NOT NULL DEFAULT 0,
  reputation  int NOT NULL DEFAULT 50,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── User Skills ─────────────────────────────────────────────
CREATE TABLE public.user_skills (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_key   text NOT NULL,
  level       int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_key)
);

-- ─── Scenario Runs ───────────────────────────────────────────
CREATE TABLE public.scenario_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scenario_id     text NOT NULL,
  status          text NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'won', 'lost', 'pending')),
  score           int CHECK (score >= 0 AND score <= 100),
  xp_earned       int NOT NULL DEFAULT 0,
  current_week    int NOT NULL DEFAULT 1,
  state           jsonb NOT NULL DEFAULT '{}',
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

-- ─── User Badges ─────────────────────────────────────────────
CREATE TABLE public.user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_key   text NOT NULL,
  earned_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

-- ─── RFP Runs ────────────────────────────────────────────────
CREATE TABLE public.rfp_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rfp_id          text NOT NULL,
  status          text NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'submitted', 'won', 'lost')),
  score           int CHECK (score >= 0 AND score <= 100),
  xp_earned       int NOT NULL DEFAULT 0,
  state           jsonb NOT NULL DEFAULT '{}',
  started_at      timestamptz NOT NULL DEFAULT now(),
  submitted_at    timestamptz,
  completed_at    timestamptz
);

-- ============================================================
-- Index pour les performances
-- ============================================================
CREATE INDEX idx_scenario_runs_user_id ON public.scenario_runs(user_id);
CREATE INDEX idx_scenario_runs_status  ON public.scenario_runs(user_id, status);
CREATE INDEX idx_rfp_runs_user_id      ON public.rfp_runs(user_id);
CREATE INDEX idx_user_badges_user_id   ON public.user_badges(user_id);
CREATE INDEX idx_user_skills_user_id   ON public.user_skills(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_runs       ENABLE ROW LEVEL SECURITY;

-- users : lecture et modification de son propre profil uniquement
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- user_skills
CREATE POLICY "skills_own" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

-- scenario_runs
CREATE POLICY "scenario_runs_own" ON public.scenario_runs
  FOR ALL USING (auth.uid() = user_id);

-- user_badges
CREATE POLICY "badges_own" ON public.user_badges
  FOR ALL USING (auth.uid() = user_id);

-- rfp_runs
CREATE POLICY "rfp_runs_own" ON public.rfp_runs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Trigger : synchronise le niveau XP automatiquement
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.xp_total >= 20000 THEN 7
    WHEN NEW.xp_total >= 12000 THEN 6
    WHEN NEW.xp_total >= 7000  THEN 5
    WHEN NEW.xp_total >= 3500  THEN 4
    WHEN NEW.xp_total >= 1500  THEN 3
    WHEN NEW.xp_total >= 500   THEN 2
    ELSE 1
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_level
  BEFORE INSERT OR UPDATE OF xp_total ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_level();
