-- Migration: Harden Public Read Policies & Restrict Sensitive Data
+-- This migration enforces Row Level Security (RLS) on `fish` and `fish_translations`
+-- so that unauthenticated public traffic (anon) can only read published entries,
+-- and revokes direct select permissions on internal fields like `author_notes`.

-- RLS für fish: Public darf nur veröffentlichte Fische sehen
DROP POLICY IF EXISTS "Enable read access for all users" ON fish;

CREATE POLICY "Public reads only published fish"
  ON fish FOR SELECT TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated reads all fish"
  ON fish FOR SELECT TO authenticated
  USING (true);

-- RLS für fish_translations: Übersetzungen nur für veröffentlichte Fische
DROP POLICY IF EXISTS "Enable read access for all users" ON fish_translations;

CREATE POLICY "Public reads published translations"
  ON fish_translations FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM fish f WHERE f.id = fish_translations.fish_id AND f.is_published
  ));

-- Performance-Index für den RLS-Check
CREATE INDEX IF NOT EXISTS idx_fish_published_true
  ON fish (id) WHERE is_published = true;

-- Sensible Spalte für Public-Traffic sperren
REVOKE SELECT (author_notes) ON fish FROM anon;
