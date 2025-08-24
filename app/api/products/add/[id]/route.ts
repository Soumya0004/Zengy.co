import { dbConnect } from "@/lib/mongodb";
import Collections from "@/models/Collections";
import { NextResponse } from "next/server";

// GET /api/products/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await Collections.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching product by id:", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
