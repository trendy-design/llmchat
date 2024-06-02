import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest, resp: NextResponse) {
  return NextResponse.json({ bots: [] });
}
