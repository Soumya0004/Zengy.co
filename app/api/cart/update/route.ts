import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import Collections from "@/lib/models/Collections";

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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
    if (!Number.isSafeInteger(qty) || qty < 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a non-negative integer" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ _id: cartId, user: userId });
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
      item.deleteOne();
    } else {
      const product = await Collections.findById(item.product);
      const sizeStock = product?.sizes.find((size) => size.size === item.size);
      if (!product || !sizeStock || qty > sizeStock.stock) {
        return NextResponse.json(
          { success: false, message: "Quantity exceeds available stock" },
          { status: 400 }
        );
      }

      item.quantity = qty;
      item.price = product.price;
      item.name = product.title;
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
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
