import { NextResponse } from "next/server";
import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.find({ userId }).lean();

    return NextResponse.json({ success: true, wishlist });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Wishlist GET error:", errorMsg, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist", details: errorMsg },
      { status: 500 }
    );
  }
}
