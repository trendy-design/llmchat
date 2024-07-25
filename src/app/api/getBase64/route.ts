import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest, resp: NextResponse) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("imageUrl");
  if (!imageUrl) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the image as a binary array
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Convert the binary data to Base64
    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"] || "image/jpeg";
    return NextResponse.json(
      { base64: `data:${mimeType};base64,${base64Image}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Error fetching image" },
      { status: 500 }
    );
  }
}
