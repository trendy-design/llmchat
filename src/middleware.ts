import { updateSession } from "@/utils/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, "1 d"),
});

export const config = {
  matcher: "/api/llmchat/chat/completions",
};

export default async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    user.id,
  );
  return success
    ? supabaseResponse
    : NextResponse.json(
        { message: "Exceeded daily llmchat usage limit" },
        { status: 429 },
      );
}
