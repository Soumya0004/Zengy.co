import Wishlist from "@/lib/models/Wishlist";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { message: "userId and productId required" },
        { status: 400 }
      );
    }

    await Wishlist.findOneAndDelete({ userId, productId });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
