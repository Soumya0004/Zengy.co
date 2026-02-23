import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { cartId, productId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // ✅ REMOVE from CART (not order)
    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        $pull: {
          products: { _id: productId }, // subdocument id
        },
      },
      { new: true }
    ).populate("products.collection");

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // ✅ Recalculate total price
    updatedCart.totalPrice = updatedCart.products.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    await updatedCart.save();

    return NextResponse.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("❌ Error removing cart product:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
