import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      img,
      title,
      price,
      category,
      rating = 0,
      sizes,
      stock,
      description,
    } = body;

    if (!img || !title || typeof price !== "number" || !category) {
      return NextResponse.json(
        { error: "img, title, price, category required" },
        { status: 400 }
      );
    }

    /* ⭐ NORMALIZATION (PERMANENT FIX) */

    let normalizedSizes;

    if (Array.isArray(sizes) && sizes.length > 0) {
      normalizedSizes = sizes;
    } else {
      // simple product
      normalizedSizes = [{ size: "default", stock: stock || 0 }];
    }

    const product = await Collections.create({
      img,
      title,
      price,
      category,
      rating,
      sizes: normalizedSizes,
      discount: body.discount || 0,
      description,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}