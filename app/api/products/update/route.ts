import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { dbConnect } from "@/lib/mongodb";
import Collections from "@/models/Collections";

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const { id } = params;
    const formData = await req.formData();

    const file = formData.get("img") as File | null;
    const title = formData.get("title") as string | null;
    const price = formData.get("price") as string | null;
    const category = formData.get("category") as string | null;
    const rating = formData.get("rating") as string | null;
    const stock = formData.get("stock") as string | null;

    const product = await Collections.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imgUrl = product.img;

    // ✅ Upload new image if provided
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imgUrl = uploadResult.secure_url;
    }

    // ✅ Update fields
    if (title) product.title = title;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (rating) product.rating = Number(rating);

    if (stock) {
      product.stock = Number(stock);
      product.availability = Number(stock) > 0 ? "in stock" : "out of stock"; // ✅ auto update
    }

    if (imgUrl) product.img = imgUrl;

    await product.save();

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Update product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
