import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";

export const dynamic = "force-dynamic";

/* =====================================================
   GET /api/products/:id/similar
===================================================== */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ Next 15 requires Promise
) {
  try {
    await dbConnect();

    const { id } = await params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json([], { status: 400 });
    }

    
    const product = await Collections.findById(id).lean();

    if (!product) {
      return NextResponse.json([], { status: 404 });
    }

   
    let similarProducts = await Collections.find({
      _id: { $ne: new mongoose.Types.ObjectId(id) }, // ✅ safer comparison
      category: product.category, // ✅ faster than regex
    })
      .limit(8)
      .lean();

    
    if (!similarProducts.length) {
      similarProducts = await Collections.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(id) },
          },
        },
        { $sample: { size: 8 } }, // ✅ true random
      ]);
    }

    return NextResponse.json(similarProducts, { status: 200 });

  } catch (error) {
    console.error("Similar API error:", error);

    return NextResponse.json([], { status: 500 });
  }
}
