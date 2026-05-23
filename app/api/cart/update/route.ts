import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { cartId, cartItemId, quantity } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(cartItemId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cart or item ID" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    const cart = await Cart.findById(cartId).populate("products.product");
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.products.id(cartItemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (qty === 0) {
      item.remove();
    } else {
      item.quantity = qty;
    }

    cart.totalPrice = cart.products.reduce(
      (sum: number, product: { price?: number; quantity: number }) =>
        sum + (product.price || 0) * product.quantity,
      0
    );

    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (error: unknown) {
    console.error("❌ Error updating cart item quantity:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
