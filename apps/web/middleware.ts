import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

let ratelimit: Ratelimit;

if (process.env.NEXT_PUBLIC_ENABLE_AUTH === "true") {
  if (!process.env.RATE_LIMIT_REQUESTS || !process.env.RATE_LIMIT_WINDOW) {
    throw new Error("RATE_LIMIT_REQUESTS and RATE_LIMIT_WINDOW must be set");
  }
  ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_REQUESTS),
      process.env.RATE_LIMIT_WINDOW as Parameters<
        typeof Ratelimit.slidingWindow
      >[1],
    ),
  });
}

export const config = {
  matcher: "/api/llmchat/chat/completions",
};

export default async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
    return NextResponse.json(
      { message: "Service is not available" },
      { status: 401 },
    );
  }
  const { supabaseResponse, user } = await updateSession(request);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { success } = await ratelimit.limit(user.id);

  return success
    ? supabaseResponse
    : NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
}
