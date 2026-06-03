import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * POST /api/projects
 *
 * Called AFTER the client has already submitted create_project() to GenLayer
 * and received the project_id from the on-chain tx.
 * This route ONLY caches the project in Supabase for fast indexing/search.
 * GenLayer is the source of truth.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      project_id, owner, name, category, website, description,
    } = body;

    if (!project_id || !owner || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from('projects').upsert({
      project_id,
      owner,
      name,
      category,
      website: website || '',
      description: description || '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ project_id, ok: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    return NextResponse.json({ error: 'Failed to cache project' }, { status: 500 });
  }
}

/**
 * GET /api/projects
 * Returns projects from Supabase cache (fast).
 * For each project, fetches the evaluation from GenLayer.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');

    const supabase = getServiceClient();
    let query = supabase
      .from('projects')
      .select('project_id, name, category, status, created_at, owner');

    if (owner) query = query.eq('owner', owner);

    const { data: projects, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const withEvals = await Promise.all(
      (projects || []).map(async (p) => {
        try {
          const r = await fetch(`${base}/api/evaluate?project_id=${p.project_id}`);
          const evaluation = r.ok ? await r.json() : null;
          return { project: p, evaluation: evaluation?.evaluation_id ? evaluation : null };
        } catch {
          return { project: p, evaluation: null };
        }
      })
    );

    return NextResponse.json({ projects: withEvals });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return NextResponse.json({ projects: [] });
  }
}
