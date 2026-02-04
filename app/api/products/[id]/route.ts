import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import mongoose from "mongoose";

// 🔥 VERY IMPORTANT — disables Next.js caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/products/:id
export async function GET(req: Request) {
  try {
    await dbConnect();

    // ✅ Parse the ID directly from the URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean); // remove empty segments
    const id = segments[segments.length - 1]; // last segment is the product ID

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    // ✅ Fetch the product from MongoDB
    const product = await Collections.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
