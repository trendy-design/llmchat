import { supabase } from "@/helper/supabase";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest, resp: NextResponse) {
  const { data, error } = await supabase.from("bots").select();
  return NextResponse.json({ bots: data || [] });
}
