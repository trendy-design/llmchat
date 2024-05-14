import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import OpenAI, { toFile } from "openai";

export async function POST(req: NextRequest, resp: NextResponse) {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");

  if (!apiKey) {
    return Response.json({ error: "No API key provided" }, { status: 401 });
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const body = await req.json();

  const audiobase64 = body.base64;

  const audioBuffer = Buffer.from(audiobase64, "base64");
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(audioBuffer, "audio.wav", {
      type: "audio/wav",
    }),

    model: "whisper-1",
  });

  return NextResponse.json({ text: transcription?.text });
}
