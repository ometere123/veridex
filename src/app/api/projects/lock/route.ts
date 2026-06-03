import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * POST /api/projects/lock
 *
 * Called AFTER the client has already called lock_project_data() on GenLayer.
 * Updates the Supabase cache with the new status + evidence_hash.
 */
export async function POST(req: NextRequest) {
  try {
    const { project_id, evidence_hash, wallet } = await req.json();

    if (!project_id || !wallet) {
      return NextResponse.json({ error: 'Missing project_id or wallet' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Verify ownership from Supabase cache
    const { data: project } = await supabase
      .from('projects')
      .select('owner')
      .eq('project_id', project_id)
      .single();

    if (project && project.owner.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json({ error: 'Not project owner' }, { status: 403 });
    }

    // Update cache
    await supabase
      .from('projects')
      .update({
        status: 'evaluation_locked',
        evidence_hash: evidence_hash || null,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', project_id);

    return NextResponse.json({ ok: true, status: 'evaluation_locked' });
  } catch (err) {
    console.error('POST /api/projects/lock error:', err);
    return NextResponse.json({ error: 'Failed to sync lock status' }, { status: 500 });
  }
}
