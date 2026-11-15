import { NextResponse } from "next/server";
import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
import { getAuthenticatedUserId } from "@/lib/api-auth";
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const wishlist = await Wishlist.find({ userId: userId.toString() }).lean();

    return NextResponse.json({ success: true, wishlist });
  } catch (error: unknown) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
