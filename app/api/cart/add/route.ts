import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/lib/models/Cart";
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
    if (isNaN(qty) || qty <= 0) {
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

    // Validate stock
    if (collection.sizes?.length) {
      const sizeStock = collection.sizes.find((s) => s.size === size);

      if (!sizeStock) {
        return NextResponse.json(
          { success: false, message: "Invalid size selected" },
          { status: 400 }
        );
      }

      if (sizeStock.stock < qty) {
        return NextResponse.json(
          { success: false, message: "Not enough stock for selected size" },
          { status: 400 }
        );
      }
    }

    // ALWAYS OBJECTID (THE FIX)
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    // Fetch user's cart
    let cart = await Cart.findOne({ user: mongoUserId });

    if (!cart) {
      cart = new Cart({
        user: mongoUserId,
        products: [],
      });
    }

    const existingItem = cart.products.find((item: any) => {
      const itemId = item.collection.toString();
      return (
        itemId === productId.toString() &&
        item.size === size
      );
    });

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.products.push({
        collection: new mongoose.Types.ObjectId(productId),
        size,
        quantity: qty,
        price,
        name,
      });
    }

    const totalPrice = cart.products.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
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
