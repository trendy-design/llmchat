import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const requestHeaders = new Headers(req.headers);

  const body = await req.json();
  const response = await axios({
    method: "POST",
    url: `https://api.openai.com/v1/chat/completions`,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    data: {
      ...body,
      model: "gpt-4o-mini",
      stream: true,
    },
    responseType: "stream",
  });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // response.data.on("data", async (chunk: Buffer) => {
  //   const decodedChunk = chunk.toString("utf8");
  //   const lines = decodedChunk.split("\n");
  //   for (const line of lines) {
  //     if (line.startsWith("data: ")) {
  //       const data = line.slice(6);
  //       if (data.trim() === "[DONE]") {
  //         await writer.close();
  //         return;
  //       }
  //       await writer.write(encoder.encode(`data: ${data}\n\n`));
  //     }
  //   }
  // });

  // response.data.on("end", async () => {
  //   await writer.close();
  // });

  return new Response(response.data);
}
