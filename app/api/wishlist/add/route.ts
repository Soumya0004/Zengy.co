import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";

export async function POST(req: Request) {
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

    await Wishlist.create({ userId: userId.toString(), productId });

    return NextResponse.json(
      { message: "Added to wishlist" },
      { status: 201 }
    );
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "Already in wishlist" },
        { status: 409 }
      );
    }

    console.error("Wishlist add error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
