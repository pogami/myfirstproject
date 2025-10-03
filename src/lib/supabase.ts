import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with proper error handling
let supabase: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase initialized successfully:', supabaseUrl);
  } else {
    console.warn('⚠️  Supabase environment variables missing - Real-time chat disabled');
    console.warn('Supabase URL:', supabaseUrl);
    console.warn('Supabase Key:', supabaseAnonKey ? ' present' : 'Missing');
    console.warn('To enable real-time chat, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  }
} catch (error) {
  console.error('❌ Error initializing Supabase:', error);
  supabase = null;
}

export { supabase }
export default supabase
