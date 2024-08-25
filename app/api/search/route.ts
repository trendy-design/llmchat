import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const { query } = await req.json();

  if (!query) {
    return Response.json({ error: "No Query provided" }, { status: 401 });
  }
  const tool = new DuckDuckGoSearch({ maxResults: 5 });

  // Get the results of a query by calling .invoke on the tool.

  const results = await tool.invoke(query);

  return NextResponse.json({ results: results });
}
