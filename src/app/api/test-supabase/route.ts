import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Dynamic import to get the current Supabase client and status
    const { supabase, getSupabaseStatus } = await import('@/lib/supabase');
    
    const status = getSupabaseStatus();
    console.log('Supabase status:', status);
    
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase client not initialized',
        status: {
          isInitialized: status.isInitialized,
          url: status.url,
          keyPresent: status.keyPresent,
          envUrl: status.envUrl,
          envKey: status.envKey
        }
      }, { status: 500 });
    }
    
    // Test basic connectivity by checking if we can query
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase test failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        hint: error.hint,
        details: error.details,
        message: 'Supabase connection failed - table might not exist',
        status: {
          isInitialized: status.isInitialized,
          url: status.url,
          keyPresent: status.keyPresent,
          envUrl: status.envUrl,
          envKey: status.envKey
        }
      }, { status: 500 });
    }
    
    console.log('✅ Supabase test successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working!',
      data: data,
      status: {
        isInitialized: status.isInitialized,
        url: status.url,
        keyPresent: status.keyPresent,
        envUrl: status.envUrl,
        envKey: status.envKey
      }
    });
    
  } catch (error: any) {
    console.error('❌ Supabase test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Supabase connection error'
    }, { status: 500 });
  }
}