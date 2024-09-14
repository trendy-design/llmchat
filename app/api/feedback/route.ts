import { supabase } from "@/libs/utils/supabase";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest, resp: NextResponse) {
  const { feedback, feedbackType, email } = await req.json();

  if (!feedback || !feedbackType) {
    return NextResponse.json({
      success: false,
      error: "Feedback and feedback type are required",
    });
  }

  await supabase.from("feedbacks").insert({ feedback, feedbackType, email });
  return NextResponse.json({ success: true });
}
