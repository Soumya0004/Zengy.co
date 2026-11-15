import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart, { ICartProduct } from "@/lib/models/Cart";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { cartId, cartItemId, productId } = await req.json();
    const itemId = cartItemId || productId;

    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // REMOVE from CART
    const updatedCart = await Cart.findOne({ _id: cartId, user: userId });

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = updatedCart.products.id(itemId);
    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    item.deleteOne();
    updatedCart.totalPrice = (updatedCart.products as ICartProduct[]).reduce(
      (sum: number, item: ICartProduct) =>
        sum + (item.price || 0) * item.quantity,
      0
    );

    await updatedCart.save();

    return NextResponse.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: unknown) {
    console.error("❌ Error removing cart product:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}