import { NextResponse } from "next/server";
import { enqueueChatbotReply } from "@/lib/job-queue";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const message =
    typeof body === "object" && body !== null && "message" in body
      ? body.message
      : null;

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "A message is required" }, { status: 400 });
  }

  try {
    const job = await enqueueChatbotReply(message.trim());
    return NextResponse.json(
      { jobId: job.id, status: "queued" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Failed to enqueue chatbot request:", error);
    return NextResponse.json(
      { error: "Chatbot is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
