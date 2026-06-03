import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * POST /api/reevaluate
 * Called AFTER the client has called request_reevaluation() on GenLayer.
 * Syncs the new status to Supabase.
 */
export async function POST(req: NextRequest) {
  try {
    const { project_id, wallet } = await req.json();
    if (!project_id || !wallet) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getServiceClient();
    await supabase
      .from('projects')
      .update({ status: 'reevaluation_pending', updated_at: new Date().toISOString() })
      .eq('project_id', project_id);

    return NextResponse.json({ ok: true, status: 'reevaluation_pending' });
  } catch (err) {
    console.error('POST /api/reevaluate error:', err);
    return NextResponse.json({ error: 'Failed to sync reevaluation status' }, { status: 500 });
  }
}
