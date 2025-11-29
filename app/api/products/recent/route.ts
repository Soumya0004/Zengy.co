import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";

export async function GET() {
  try {
    await dbConnect();

    // Find latest 4 products (sorted by createdAt)
    const products = await Collections.find()
      .sort({ createdAt: -1 })
      .limit(4);

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("Recent products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
