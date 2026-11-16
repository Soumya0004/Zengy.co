import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Collections from "@/lib/models/Collections";
import { dbConnect } from "@/lib/mongodb";
import { enqueueProductImageCleanup } from "@/lib/job-queue";

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

    let imagePublicId: string | null = null;
    if (product.img) {
      const urlParts = product.img.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      imagePublicId = `${folder}/${publicIdWithExt.split(".")[0]}`;
    }
    
    await product.deleteOne();

    let imageCleanup: "not_required" | "queued" | "completed" = "not_required";
    if (imagePublicId) {
      try {
        await enqueueProductImageCleanup(imagePublicId);
        imageCleanup = "queued";
      } catch (queueError) {
        console.error(
          "Failed to queue product image cleanup; trying it synchronously:",
          queueError
        );

        try {
          await cloudinary.uploader.destroy(imagePublicId);
          imageCleanup = "completed";
        } catch (cleanupError) {
          console.error("Product was deleted, but image cleanup failed:", cleanupError);
          return NextResponse.json(
            {
              error: "Product was deleted, but its image could not be removed.",
              productDeleted: true,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(
      { success: true, message: "Product deleted", imageCleanup },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}