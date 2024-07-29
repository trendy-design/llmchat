import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const headersList = headers();
  const apikey = headersList.get("x-api-key");

  if (!apikey) {
    return Response.json({ error: "No API key provided" }, { status: 401 });
  }

  const requestHeaders = new Headers(req.headers);
  const requestHeadersObject = Object.fromEntries(requestHeaders.entries());

  const body = await req.json();
  const url = process.env.ANTHROPIC_API_URL || "";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: requestHeadersObject["accept"],
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "anthropic-beta": "tools-2024-05-16",
      "anthropic-version": requestHeadersObject["anthropic-version"],
      connection: requestHeadersObject["connection"],
      "content-type": "application/json",
      "x-api-key": apikey,
    },
    body: JSON.stringify(body),
  });

  const resHeaders = new Headers(res.headers);
  const headersObject = Object.fromEntries(resHeaders.entries());

  const stream = new TransformStream();

  const writer = stream.writable.getWriter();
  const reader = res.body?.getReader();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const pump = async () => {
    const { value, done } = await reader?.read()!;
    if (done) {
      writer.close();
      return;
    }

    const chunk = decoder.decode(value, { stream: true });
    writer.write(encoder.encode(chunk));
    pump();
  };

  pump();

  return new Response(stream.readable, {
    headers: {
      "Transfer-Encoding": headersObject["transfer-encoding"],
      charset: "utf-8",
      "Content-Type": headersObject["content-type"],
    },
    status: res.status,
  });
}
