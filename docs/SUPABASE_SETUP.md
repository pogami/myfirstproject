# CourseConnect AI - Supabase Real-time Chat Setup

This guide will help you set up Supabase for real-time chat functionality in CourseConnect AI.

## Prerequisites

- Node.js and npm installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `courseconnect-ai-chat`
   - Database Password: Generate a strong password and save it
   - Region: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Run Database Setup

1. Go to your project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase-setup.sql`
5. Click "Run" to execute the script
6. You should see: `CourseConnect AI Chat Database Setup Complete! ✅`

## Step 3: Get Your Credentials

1. Go to "Settings" → "API" in your project
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 4: Configure Environment Variables

1. Copy `env-template.txt` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Open `http://localhost:9002/dashboard/chat`
3. You should see "✅ Supabase initialized successfully" in the console
4. Try sending a message - it should appear in real-time

## Troubleshooting

### Chat Not Loading
- Check that "Supabase initialized successfully" appears in the console
- Verify your `.env.local` file exists and has correct values
- Ensure you've run the `supabase-setup.sql` script

### Messages Not Syncing
- Check the Supabase Dashboard → "Table Editor" → "messages" for any errors
- Verify your Row Level Security policies are in place
- Check browser console for error messages

### Environment Variables Not Loading
- Make sure `.env.local` is in your project root
- Restart your development server after changing environment variables
- Check that variable names start with `NEXT_PUBLIC_`

## Production Deployment

For production deployment (Vercel, Netlify, etc.):

1. Go to your deployment platform's environment variables section
2. Add the same Supabase variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Save and redeploy

## Database Schema

The setup creates a `messages` table with the following structure:

```sql
CREATE TABLE public.messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_photo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Security Notes

- The `anon` key is safe to use in frontend code
- Row Level Security (RLS) is enabled for all users
- Messages are stored securely and can only be accessed by authorized users
- All real-time updates are encrypted via SSL

## Support

If you run into issues:

1. Check the [CourseConnect AI Issues](https://github.com/your-repo/issues) page
2. Review the [Supabase Documentation](https://supabase.com/docs)
3. Join our community Discord for help

---

**Need help?** Check out our [FAQ](./FAQ.md) or open an issue on GitHub!
