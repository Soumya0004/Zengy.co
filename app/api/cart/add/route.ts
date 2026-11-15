import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart, { ICartProduct } from "@/lib/models/Cart";
import Collections from "@/lib/models/Collections";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const mongoUserId = await getAuthenticatedUserId();
    if (!mongoUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId, size, quantity } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
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

    const qty = Number(quantity);
    if (!Number.isSafeInteger(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const sizeStock = collection.sizes?.find((s) => s.size === size);
    if (!sizeStock || sizeStock.stock <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid size selected or out of stock" },
        { status: 400 }
      );
    }

    const productObjId = new mongoose.Types.ObjectId(productId);

    let cart = await Cart.findOne({ user: mongoUserId });

    if (!cart) {
      cart = new Cart({
        user: mongoUserId,
        products: [],
      });
    }

    const existingItem = cart.products.find(
      (item: ICartProduct) =>
        item.product && item.product.toString() === productObjId.toString() &&
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
        product: productObjId,
        size,
        quantity: qty,
        price: collection.price,
        name: collection.title,
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
    console.error("Error adding to cart:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
