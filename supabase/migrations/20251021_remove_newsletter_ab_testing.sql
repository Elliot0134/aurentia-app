-- Migration: Remove A/B Testing from Newsletters
-- Description: Removes all A/B testing related columns from org_newsletters table

-- =============================================
-- 1. Drop A/B testing columns from org_newsletters table
-- =============================================

ALTER TABLE org_newsletters
DROP COLUMN IF EXISTS is_ab_test,
DROP COLUMN IF EXISTS parent_newsletter_id,
DROP COLUMN IF EXISTS variant_name,
DROP COLUMN IF EXISTS test_percentage;

-- =============================================
-- 2. Drop any indexes related to A/B testing (if they exist)
-- =============================================

DROP INDEX IF EXISTS idx_org_newsletters_parent_newsletter_id;
DROP INDEX IF EXISTS idx_org_newsletters_is_ab_test;

-- =============================================
-- Migration complete
-- =============================================
-- All A/B testing functionality has been removed from the newsletter system.
-- Newsletter analytics are now consolidated in the main organization analytics page.
