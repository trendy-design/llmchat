// pages/api/mcp-proxy/[server]/sse.ts
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';


const redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN
})
      


export async function POST(request: NextRequest) {

        


  try {
    let jsonRpcRequest;
    let serverURL;
    let serverHost;
    try {
      const text = await request.text();
      console.log(`JSONRPC text:`, text);
      
      jsonRpcRequest = JSON.parse(text);

      serverURL = request.headers.get('x-base-url') as string;
      serverHost = new URL(serverURL).host;

      console.log("serverURL", serverURL);
      console.log("serverHost", serverHost);

      if (!serverURL || !serverHost) {
        console.error('POST request - Missing serverURL parameter');
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            error: { code: -32602, message: "Missing serverURL parameter" },
            id: null
          }, 
          { status: 400 }
        );
      }

    

      // Validate basic JSONRPC structure
      if (!jsonRpcRequest.jsonrpc || jsonRpcRequest.jsonrpc !== "2.0") {
        throw new Error("Invalid JSONRPC request");
      }
    } catch (err) {
      console.error("Error parsing JSONRPC request:", err);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32700, message: "Parse error" },
          id: null
        },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.nextUrl.pathname, serverURL);
    requestUrl.search = request.nextUrl.search;
    console.log("requestUrl", requestUrl);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: serverHost,
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    const responseText = await response.text();
    console.log(`JSONRPC response status: ${response.status}, body: ${responseText}`);
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (err) {
      console.error("Error parsing JSONRPC response:", err);
      jsonResponse = {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error: Invalid JSON response from server" },
        id: jsonRpcRequest.id || null
      };
    }
    
    return NextResponse.json(jsonResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error(`Error in POST handler:`, error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error" },
        id: null
      }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
