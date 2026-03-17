import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const motionTypes = searchParams.get('motionTypes')?.split(',').filter(Boolean) || [];
    const styles = searchParams.get('styles')?.split(',').filter(Boolean) || [];
    let query = supabase
      .from('motions')
      .select(`*, brand:brands(*)`)
      .order('created_at', { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,app_name.ilike.%${q}%`);
    }
    if (brands.length > 0) {
      query = query.in('brand_id', brands);
    }
    if (motionTypes.length > 0) {
      query = query.overlaps('motion_type', motionTypes);
    }
    if (styles.length > 0) {
      query = query.overlaps('style_tags', styles);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Request failed', detail: msg }, { status: 500 });
  }
}
