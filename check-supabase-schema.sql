-- CHECK SUPABASE SCHEMA - Run this in Supabase SQL Editor first

-- Check if messages table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'messages'
    ) 
    THEN '✅ Table EXISTS' 
    ELSE '❌ Table DOES NOT EXIST - Run fix-supabase-schema.sql' 
  END as table_status;

-- Show all columns if table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'messages';

-- Check if table is in real-time publication
SELECT 
  p.pubname,
  n.nspname,
  c.relname
FROM pg_publication p
JOIN pg_publication_rel pr ON p.oid = pr.prpubid
JOIN pg_class c ON pr.prrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE p.pubname = 'supabase_realtime' 
  AND c.relname = 'messages';

