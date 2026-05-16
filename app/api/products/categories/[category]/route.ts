import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> } // ✅ Type params as a Promise
) {
  try {
    await dbConnect();

    // ✅ Await the params object before pulling properties out of it
    const resolvedParams = await params;
    const category = decodeURIComponent(resolvedParams.category).trim();

    const products = await Collections.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    return NextResponse.json(
      {
        success: true,
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Category fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}