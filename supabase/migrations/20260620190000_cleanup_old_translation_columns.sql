-- Migration: Cleanup Old Translation Columns
-- This migration drops the language-specific columns from the base `fish` table
-- now that they have been safely migrated to `fish_translations`.

ALTER TABLE fish 
  DROP COLUMN IF EXISTS search_vector,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS slug,
  DROP COLUMN IF EXISTS common_other_names,
  DROP COLUMN IF EXISTS description_general,
  DROP COLUMN IF EXISTS description_habitat_details,
  DROP COLUMN IF EXISTS description_care_aquarium,
  DROP COLUMN IF EXISTS description_social_behavior,
  DROP COLUMN IF EXISTS description_breeding;
