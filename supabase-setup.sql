-- CourseConnect AI - Real-time Chat Database Setup
-- SAFE TO RUN MULTIPLE TIMES (Idempotent)
-- This script sets up the real-time chat system using Supabase

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  user_photo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Safely add table to real-time publication (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Allow public read access" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert" ON public.messages;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.messages FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'CourseConnect AI Chat Database Setup Complete! ✅' as result;