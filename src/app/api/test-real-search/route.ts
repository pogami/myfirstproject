import { NextRequest, NextResponse } from 'next/server';
import { searchCurrentInformation } from '@/ai/services/web-search-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'No query provided' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Testing REAL web search for: ${query}`);
    
    // Use the actual web search service
    const searchResult = await searchCurrentInformation(query);
    
    return NextResponse.json({
      success: searchResult.success !== false,
      query: query,
      results: searchResult.results,
      error: searchResult.error,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Real web search test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform real web search',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
