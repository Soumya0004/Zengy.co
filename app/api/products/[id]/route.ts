import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import mongoose from "mongoose";

// GET /api/products/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // params is async
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    // ✅ Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // ✅ Fetch product
    const product = await Collections.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
