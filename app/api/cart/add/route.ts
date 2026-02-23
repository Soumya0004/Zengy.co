import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart, { ICartProduct } from "@/lib/models/Cart";
import Collections from "@/lib/models/Collections";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, productId, size, quantity, price, name } = await req.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be > 0" },
        { status: 400 }
      );
    }

    const collection = await Collections.findById(productId);
    if (!collection) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const sizeStock = collection.sizes.find((s) => s.size === size);
    if (!sizeStock) {
      return NextResponse.json(
        { success: false, message: "Invalid size selected" },
        { status: 400 }
      );
    }

    const mongoUserId = new mongoose.Types.ObjectId(userId);

    let cart = await Cart.findOne({ user: mongoUserId });

    if (!cart) {
      cart = new Cart({
        user: mongoUserId,
        products: [],
      });
    }

    const existingItem = cart.products.find(
      (item: ICartProduct) =>
        item.collection.toString() === productId.toString() &&
        item.size === size
    );

    // 🔥 prevent cart > stock
    if (existingItem) {
      const newQty = existingItem.quantity + qty;

      if (newQty > sizeStock.stock) {
        return NextResponse.json(
          { success: false, message: "Exceeds available stock" },
          { status: 400 }
        );
      }

      existingItem.quantity = newQty;
    } else {
      if (qty > sizeStock.stock) {
        return NextResponse.json(
          { success: false, message: "Not enough stock" },
          { status: 400 }
        );
      }

      cart.products.push({
        collection: new mongoose.Types.ObjectId(productId),
        size,
        quantity: qty,
        price,
        name,
      });
    }

    const totalPrice = cart.products.reduce(
      (sum: number, item: ICartProduct) => sum + (item.price || 0) * item.quantity,
      0
    );

    cart.set({ totalPrice });
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
