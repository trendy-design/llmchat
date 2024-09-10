import { supabase } from "@/libs/utils/supabase";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest, resp: NextResponse) {
  const { data, error } = await supabase?.from("changelogs").select();
  console.log(data, error);
  return NextResponse.json({ changelogs: data || [] });
}
