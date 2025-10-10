import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytemrzkyflndrslbbdga.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZW1yemt5ZmxuZHJzbGJiZGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY1NjYsImV4cCI6MjA3NTAwMjU2Nn0.vHcmSM1YLvtKYmwJK_9IDgLLbgXiy154kdATIAHRwNM';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test insert with minimal required data - try user_name instead of username
    const testMessage = {
      id: `test-${Date.now()}`,
      content: 'Test message',
      sender: 'user',
      chat_id: 'public-general-chat',
      user_id: 'guest-test',
      user_name: 'TestUser', // Using user_name to match working commit 690dbdf
      user_photo_url: '',
      created_at: new Date().toISOString()
    };

    console.log('🧪 Testing insert with:', testMessage);

    const { data, error } = await supabase
      .from('messages')
      .insert([testMessage]);

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 400 });
    }

    console.log('✅ Insert successful:', data);
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Insert test successful' 
    });

  } catch (error: any) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
