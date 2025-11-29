import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const queryUser = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // ✅ Now Cart model is used (not Order model)
    const cart = await Cart.findOne({ user: queryUser }).populate(
      "products.collection"
    );

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: { products: [], _id: null },
      });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error("❌ Error fetching cart:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
