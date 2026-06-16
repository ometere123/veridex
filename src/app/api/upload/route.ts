import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET || 'veridex-evidence';
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 400 });

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getServiceClient();

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
