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
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.find({ userId });

    return NextResponse.json(wishlist);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
