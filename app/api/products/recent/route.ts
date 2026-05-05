import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";

export async function GET() {
  try {
    await dbConnect();

    // Find latest 4 products (sorted by createdAt)
    const products = await Collections.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Recent products error:", errorMsg, error);
    return NextResponse.json({ success: false, error: "Failed to fetch recent products", details: errorMsg }, { status: 500 });
  }
}
