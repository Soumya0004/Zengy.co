import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { category: string } }
) {
  try {
    await dbConnect();

    const category = decodeURIComponent(params.category).trim();

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
  } catch (error) {
    console.error("Category fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}