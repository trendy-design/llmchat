import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const { query } = await req.json();

  if (!query) {
    return Response.json({ error: "No Query provided" }, { status: 401 });
  }
  const tool = new DuckDuckGoSearch({ maxResults: 5 });
  const results = await tool.invoke(query);

  return NextResponse.json({ results: results });
} 