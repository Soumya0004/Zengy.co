import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.collection"
    );

    return NextResponse.json({
      success: true,
      cart: cart || { products: [], _id: null },
    });
  } catch (err: any) {
    console.error("Cart GET error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
