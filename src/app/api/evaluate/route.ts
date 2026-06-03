import { NextRequest, NextResponse } from 'next/server';
import { getEvaluation } from '@/lib/genlayer';
import { getServiceClient } from '@/lib/supabase';

/**
 * GET /api/evaluate?project_id=...
 * Reads evaluation from GenLayer (source of truth).
 */
export async function GET(req: NextRequest) {
  try {
    const project_id = new URL(req.url).searchParams.get('project_id');
    if (!project_id) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
    }

    const evaluation = await getEvaluation(project_id);
    if (!evaluation) {
      return NextResponse.json({ error: 'No evaluation found' }, { status: 404 });
    }

    return NextResponse.json(evaluation);
  } catch (err) {
    console.error('GET /api/evaluate error:', err);
    return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 });
  }
}

/**
 * POST /api/evaluate
 *
 * Called AFTER the client has:
 *   1. Called submit_evaluation() on GenLayer
 *   2. Called run_evaluation() on GenLayer
 *   3. Called finalize_score() on GenLayer
 *
 * This route reads the final evaluation from GenLayer and syncs to Supabase cache.
 * SCORES ARE NEVER GENERATED HERE — only read from GenLayer and cached.
 */
export async function POST(req: NextRequest) {
  try {
    const { project_id, wallet } = await req.json();

    if (!project_id || !wallet) {
      return NextResponse.json({ error: 'Missing project_id or wallet' }, { status: 400 });
    }

    // Read the evaluation result from GenLayer (source of truth)
    const evaluation = await getEvaluation(project_id);
    if (!evaluation) {
      return NextResponse.json({ error: 'No evaluation found on-chain' }, { status: 404 });
    }

    // Sync evaluation to Supabase cache
    const supabase = getServiceClient();

    await supabase.from('evaluations').upsert({
      evaluation_id: evaluation.evaluation_id,
      project_id,
      overall_score: evaluation.overall_score,
      tier: evaluation.tier,
      technical_score: evaluation.technical_score,
      team_score: evaluation.team_score,
      market_fit_score: evaluation.market_fit_score,
      security_score: evaluation.security_score,
      execution_score: evaluation.execution_score,
      token_utility_score: evaluation.token_utility_score,
      confidence: evaluation.confidence,
      evaluated_at: evaluation.evaluated_at
        ? new Date(Number(evaluation.evaluated_at) * 1000).toISOString()
        : new Date().toISOString(),
    });

    await supabase
      .from('projects')
      .update({ status: 'ranked', updated_at: new Date().toISOString() })
      .eq('project_id', project_id);

    // Send notification
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('project_id', project_id)
      .single();

    await supabase.from('notifications').insert({
      wallet_address: wallet,
      type: 'evaluation_complete',
      title: 'Evaluation Complete',
      message: `${project?.name ?? project_id} scored ${evaluation.overall_score} — Tier ${evaluation.tier}`,
      project_id,
      read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, evaluation });
  } catch (err) {
    console.error('POST /api/evaluate error:', err);
    return NextResponse.json({ error: 'Failed to sync evaluation' }, { status: 500 });
  }
}
