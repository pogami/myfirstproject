import { NextRequest, NextResponse } from 'next/server';
import { RealtimeChangelogManager, RealtimeChangelogEntry } from '@/lib/realtime-changelog';

/**
 * GET /api/changelog/realtime
 * Get all real-time changelog entries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFacingOnly = searchParams.get('userFacing') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '50');

    let entries: RealtimeChangelogEntry[];
    
    if (userFacingOnly) {
      entries = await RealtimeChangelogManager.getUserFacingEntries();
    } else {
      entries = await RealtimeChangelogManager.getAllEntries();
    }

    // Apply limit
    if (limit > 0) {
      entries = entries.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length
    });
  } catch (error) {
    console.error('Failed to get real-time changelog entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch changelog entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/changelog/realtime
 * Add a new real-time changelog entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, type, changes, impact, author } = body;

    // Validate required fields
    if (!version || !type || !changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: version, type, changes' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['launch', 'feature', 'enhancement', 'bug-fix', 'security', 'performance'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      );
    }

    // Validate impact
    const validImpacts = ['low', 'medium', 'high', 'critical'];
    if (impact && !validImpacts.includes(impact)) {
      return NextResponse.json(
        { success: false, error: 'Invalid impact. Must be one of: ' + validImpacts.join(', ') },
        { status: 400 }
      );
    }

    const entryId = await RealtimeChangelogManager.addEntry({
      date: new Date().toISOString().split('T')[0],
      version,
      type,
      changes,
      impact: impact || 'medium',
      author: author || 'Development Team'
    });

    return NextResponse.json({
      success: true,
      entryId,
      message: 'Changelog entry added successfully'
    });
  } catch (error) {
    console.error('Failed to add real-time changelog entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add changelog entry' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/changelog/realtime
 * Update an existing real-time changelog entry
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, updates } = body;

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: entryId' },
        { status: 400 }
      );
    }

    await RealtimeChangelogManager.updateEntry(entryId, updates);

    return NextResponse.json({
      success: true,
      message: 'Changelog entry updated successfully'
    });
  } catch (error) {
    console.error('Failed to update real-time changelog entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update changelog entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/changelog/realtime
 * Delete a real-time changelog entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: entryId' },
        { status: 400 }
      );
    }

    await RealtimeChangelogManager.deleteEntry(entryId);

    return NextResponse.json({
      success: true,
      message: 'Changelog entry deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete real-time changelog entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete changelog entry' },
      { status: 500 }
    );
  }
}
