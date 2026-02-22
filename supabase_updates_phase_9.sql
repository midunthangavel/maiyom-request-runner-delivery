-- =======================================================
-- MAIYOM MISSIONS: DATABASE MIGRATION SCRIPT
-- Phase 9 Updates: Growth & Monetization
-- =======================================================

-- 1. MISSIONS TABLE UPDATES (Feature 16: Boost & Feature 17: Additional Costs)
ALTER TABLE missions
    ADD COLUMN IF NOT EXISTS is_boosted boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS additional_costs jsonb DEFAULT '[]'::jsonb;
