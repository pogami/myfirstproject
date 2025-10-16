import { NextRequest, NextResponse } from 'next/server';
// import { AutoChangelogDetector, logChange, logChanges } from '@/lib/auto-changelog';

/**
 * POST /api/changelog/auto
 * Automatically detect and log changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, version, files, author, changes } = body;

    // Single change
    if (description) {
      // const entryId = await logChange(description, version, files, author);
      
      // if (!entryId) {
      //   return NextResponse.json(
      //     { success: false, error: 'No significant change detected' },
      //     { status: 400 }
      //   );
      // }

      return NextResponse.json({
        success: true,
        entryId: 'disabled',
        message: 'Change auto-logged successfully (disabled)'
      });
    }

    // Multiple changes
    if (changes && Array.isArray(changes)) {
      // const entryIds = await logChanges(changes, version, author);
      
      return NextResponse.json({
        success: true,
        entryIds: ['disabled'],
        count: changes.length,
        message: `${changes.length} changes auto-logged successfully (disabled)`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required fields: description or changes' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to auto-log changes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-log changes' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/changelog/auto
 * Get auto-detection rules and patterns
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      rules: {
        keywordMappings: {},
        filePatterns: {}
      },
      message: 'Auto-detection rules retrieved successfully (disabled)'
    });
  } catch (error) {
    console.error('Failed to get auto-detection rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get auto-detection rules' },
      { status: 500 }
    );
  }
}

