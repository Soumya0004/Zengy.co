import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { message: "userId and productId required" },
        { status: 400 }
      );
    }

    await Wishlist.create({ userId, productId });

    return NextResponse.json(
      { message: "Added to wishlist" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Already in wishlist" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
