import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Rate limiting error message
  const rateLimitMessage = "Rate limit exceeded. Please try again later."

  // Write the rate limit error message
  await writer.write(encoder.encode(`data: ${rateLimitMessage}\n\ndata: [DONE]`));

  // Close the writer
  await writer.close();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
    status: 429, // Too Many Requests
  });
}
