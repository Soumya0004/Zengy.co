import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { productId } = await req.json();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: "A valid productId is required" },
        { status: 400 }
      );
    }

    await Wishlist.findOneAndDelete({
      userId: userId.toString(),
      productId,
    });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error: unknown) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
