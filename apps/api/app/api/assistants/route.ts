import { supabase } from '@repo/shared/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, resp: NextResponse) {
  const { data, error } = await supabase?.from('assistants').select();
  return NextResponse.json({ assistants: data || [] });
}
