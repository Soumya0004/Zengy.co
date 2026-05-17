import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const formData = await req.formData();

    const file = formData.get("img") as File | null;
    const title = formData.get("title") as string | null;
    const price = formData.get("price") as string | null;
    const category = formData.get("category") as string | null;
    const rating = formData.get("rating") as string | null;

    // stock update
    const size = formData.get("size") as string | null;
    const stock = formData.get("stock") as string | null;

    const product = await Collections.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ---------- IMAGE UPLOAD ---------- */
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error || !result) {
                return reject(error);
              }

              resolve({
                secure_url: result.secure_url,
              });
            }
          );

          stream.end(buffer);
        }
      );

      product.img = uploadResult.secure_url;
    }

    /* ---------- BASIC FIELD UPDATES ---------- */
    if (title !== null) product.title = title;
    if (price !== null) product.price = Number(price);
    if (category !== null) product.category = category;
    if (rating !== null) product.rating = Number(rating);

    /* ---------- SIZE STOCK UPDATE ---------- */
    if (size !== null && stock !== null) {
      const stockNumber = Number(stock);

      const sizeEntry = product.sizes.find(
        (s: { size: string; stock: number }) => s.size === size
      );

      if (!sizeEntry) {
        return NextResponse.json(
          { error: `Size ${size} not found` },
          { status: 400 }
        );
      }

      sizeEntry.stock = stockNumber;
    }

    await product.save();

    return NextResponse.json(
      {
        success: true,
        product,
        availability: product.availability,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Update product error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}