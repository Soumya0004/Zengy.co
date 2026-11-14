import { NextResponse } from "next/server";
import { getBackgroundQueue } from "@/lib/job-queue";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;

  if (!/^[\da-f-]{36}$/i.test(jobId)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  try {
    const job = await getBackgroundQueue().getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const status = await job.getState();
    if (status === "completed") {
      const result: unknown = job.returnvalue;
      const reply =
        typeof result === "object" &&
        result !== null &&
        "reply" in result &&
        typeof result.reply === "string"
          ? result.reply
          : "";

      return NextResponse.json({ status, reply });
    }

    if (status === "failed") {
      return NextResponse.json({
        status,
        error: "The assistant could not complete this request.",
      });
    }

    return NextResponse.json({ status }, { status: 202 });
  } catch (error) {
    console.error("Failed to read chatbot job status:", error);
    return NextResponse.json(
      { error: "Chatbot status is temporarily unavailable." },
      { status: 503 }
    );
  }
}
