import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Collections from "@/lib/models/Collections";
import { dbConnect } from "@/lib/mongodb";

// ✅ Removed the dynamic Params interface since this is a flat path route

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    // ✅ Read the ID directly from the JSON payload body sent by your frontend
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Collections.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Safety fallback check just in case product.img doesn't exist or is empty
    if (product.img) {
      const urlParts = product.img.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
    
    await product.deleteOne();

    return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}