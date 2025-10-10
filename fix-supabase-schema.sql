-- FIX SUPABASE SCHEMA - Run this in Supabase SQL Editor
-- This will check and fix the messages table schema

-- Step 1: Drop the existing table if it has wrong schema
DROP TABLE IF EXISTS public.messages CASCADE;

-- Step 2: Create the correct table
CREATE TABLE public.messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  user_photo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 3: Create indexes
CREATE INDEX messages_chat_id_idx ON public.messages(chat_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for public access
CREATE POLICY "Allow public read access" 
  ON public.messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update" 
  ON public.messages 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete" 
  ON public.messages 
  FOR DELETE 
  USING (true);

-- Step 6: Add table to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Step 7: Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Messages table created with correct schema!' as result;

