import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import Collections from "@/models/Collections";
import { dbConnect } from "@/lib/mongodb";

interface Params {
  params: { id: string };
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const { id } = params;

    const product = await Collections.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Extract Cloudinary public_id from the URL to delete the image
    const urlParts = product.img.split("/");
    const publicIdWithExt = urlParts[urlParts.length - 1]; // e.g. xyz123.jpg
    const folder = urlParts[urlParts.length - 2]; // e.g. "products"
    const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete product from MongoDB
    await product.deleteOne();

    return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
