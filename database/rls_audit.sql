-- =====================================================
-- RLS AUDIT SCRIPT
-- =====================================================
-- Purpose: Identify tables without RLS enabled and tables
-- with no policies, plus a summary of policies per table.
--
-- Run in Supabase SQL Editor.
-- =====================================================

-- 1) Tables without RLS enabled
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND c.relrowsecurity = false
ORDER BY schema_name, table_name;

-- 2) Tables with RLS enabled but NO policies
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND c.relrowsecurity = true
GROUP BY n.nspname, c.relname
HAVING COUNT(p.policyname) = 0
ORDER BY schema_name, table_name;

-- 3) Policy counts by table (quick overview)
SELECT
  p.schemaname AS schema_name,
  p.tablename AS table_name,
  COUNT(*) AS policy_count
FROM pg_policies p
WHERE p.schemaname = 'public'
GROUP BY p.schemaname, p.tablename
ORDER BY policy_count ASC, table_name ASC;

-- 4) Policy details (inspect for gaps)
SELECT
  p.schemaname,
  p.tablename,
  p.policyname,
  p.cmd,
  p.roles,
  p.permissive,
  p.qual,
  p.with_check
FROM pg_policies p
WHERE p.schemaname = 'public'
ORDER BY p.tablename, p.policyname;

-- 5) Optional: Check for tables missing updated_at trigger (if you expect it)
-- Uncomment if you use updated_at convention
-- SELECT
--   n.nspname AS schema_name,
--   c.relname AS table_name
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'r'
--   AND n.nspname = 'public'
--   AND NOT EXISTS (
--     SELECT 1
--     FROM pg_trigger t
--     WHERE t.tgrelid = c.oid
--       AND t.tgname ILIKE '%updated%'
--   )
-- ORDER BY schema_name, table_name;
