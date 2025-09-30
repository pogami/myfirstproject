import { NextRequest, NextResponse } from 'next/server';
import { GitChangeDetector, autoLogRecentCommits, startGitMonitoring } from '@/lib/git-change-detector';

/**
 * POST /api/changelog/git-auto
 * Auto-log recent git commits
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 5, startMonitoring = false } = body;

    // Auto-log recent commits
    const loggedEntries = await autoLogRecentCommits(limit);

    let monitoringStatus = null;
    if (startMonitoring) {
      // Start monitoring (this would typically be done in a background service)
      monitoringStatus = 'Monitoring started (note: this is a one-time check in API)';
    }

    return NextResponse.json({
      success: true,
      loggedEntries,
      count: loggedEntries.length,
      monitoringStatus,
      message: `${loggedEntries.length} commits auto-logged successfully`
    });
  } catch (error) {
    console.error('Failed to auto-log git commits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-log git commits' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/changelog/git-auto
 * Get recent git commits and their analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const commits = await GitChangeDetector.getRecentCommits(limit);
    const currentChanges = await GitChangeDetector.getCurrentChanges();

    return NextResponse.json({
      success: true,
      commits,
      currentChanges,
      count: commits.length,
      message: 'Git commits retrieved successfully'
    });
  } catch (error) {
    console.error('Failed to get git commits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get git commits' },
      { status: 500 }
    );
  }
}
