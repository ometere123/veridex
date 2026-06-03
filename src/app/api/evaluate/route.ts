import { NextRequest, NextResponse } from 'next/server';
import { getEvaluation, getProject, getRanking, getLeaderboard } from '@/lib/genlayer';
import { getServiceClient } from '@/lib/supabase';

/** GET — read evaluation from GenLayer (source of truth) */
export async function GET(req: NextRequest) {
  try {
    const project_id = new URL(req.url).searchParams.get('project_id');
    if (!project_id) return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
    const evaluation = await getEvaluation(project_id);
    if (!evaluation) return NextResponse.json({ error: 'No evaluation found' }, { status: 404 });
    return NextResponse.json(evaluation);
  } catch (err) {
    console.error('GET /api/evaluate:', err);
    return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 });
  }
}

/**
 * POST /api/evaluate
 *
 * Called AFTER run_evaluation() has completed on GenLayer.
 * run_evaluation does ALL ranking internally:
 *   - saves evaluation JSON to self.evaluations[project_id]
 *   - updates historical scores
 *   - updates profile
 *   - updates leaderboard
 *   - sets project status to "ranked"
 *
 * This route reads the final state from GenLayer and syncs to Supabase cache.
 * SCORES ARE NEVER GENERATED HERE — only read from GenLayer.
 */
export async function POST(req: NextRequest) {
  try {
    const { project_id, wallet } = await req.json();
    if (!project_id || !wallet) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Read all updated state from GenLayer (source of truth)
    const [evaluation, project, ranking] = await Promise.all([
      getEvaluation(project_id),
      getProject(project_id),
      getRanking(project_id).catch(() => null),
    ]);

    if (!evaluation) return NextResponse.json({ error: 'No evaluation on-chain yet' }, { status: 404 });

    // Also read leaderboards to confirm project appears
    const [overallLB, categoryLB] = await Promise.all([
      getLeaderboard('overall').catch(() => []),
      project?.category ? getLeaderboard(project.category.toLowerCase()).catch(() => []) : Promise.resolve([]),
    ]);

    // Sync evaluation to Supabase cache
    const supabase = getServiceClient();

    // Parse evaluated_at — might be a Unix timestamp string from GenLayer
    const rawTs = evaluation.evaluated_at;
    const parsedTs = rawTs && rawTs !== '0'
      ? (isNaN(Number(rawTs)) ? rawTs : new Date(Number(rawTs) * 1000).toISOString())
      : new Date().toISOString();

    try {
      await supabase.from('evaluations').upsert({
        evaluation_id:      evaluation.evaluation_id,
        project_id,
        overall_score:      evaluation.overall_score,
        tier:               evaluation.tier,
        technical_score:    evaluation.technical_score,
        team_score:         evaluation.team_score,
        market_fit_score:   evaluation.market_fit_score,
        security_score:     evaluation.security_score,
        execution_score:    evaluation.execution_score,
        token_utility_score:evaluation.token_utility_score,
        confidence:         evaluation.confidence ?? 85,
        evaluated_at:       parsedTs,
      });
    } catch (e) { console.warn('Supabase eval upsert (non-fatal):', e); }

    // Update project status in cache
    try {
      await supabase.from('projects')
        .update({ status: 'ranked', updated_at: new Date().toISOString() })
        .eq('project_id', project_id);
    } catch (e) { console.warn('Supabase project update (non-fatal):', e); }

    // Send notification
    if (project) {
      try {
        await supabase.from('notifications').insert({
          wallet_address: wallet,
          type:       'evaluation_complete',
          title:      'Evaluation Complete',
          message:    `${project.name} scored ${evaluation.overall_score} — Tier ${evaluation.tier}`,
          project_id,
          read:       false,
          created_at: new Date().toISOString(),
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      evaluation,
      ranking,
      in_overall_leaderboard:  overallLB.some((e) => e.project_id === project_id),
      in_category_leaderboard: categoryLB.some((e) => e.project_id === project_id),
    });
  } catch (err) {
    console.error('POST /api/evaluate:', err);
    return NextResponse.json({ error: 'Failed to sync evaluation' }, { status: 500 });
  }
}
