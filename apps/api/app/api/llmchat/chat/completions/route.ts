import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, resp: NextResponse) {
  const body = await req.json();
  const response = await axios({
    method: 'POST',
    url: process.env.OPENAI_API_URL,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    data: {
      ...body,
      model: 'gpt-4o-mini',
      stream: true,
    },
    responseType: 'stream',
  });

  return new Response(response.data);
}
