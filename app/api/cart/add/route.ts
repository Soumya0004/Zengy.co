import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, productId, size, quantity } = await req.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Find if user already has a pending cart (order with status 'Pending')
    let order = await Order.findOne({
      user: userId,
      status: "Pending",
    });

    if (!order) {
      // If no cart, create a new pending order
      order = new Order({
        user: new mongoose.Types.ObjectId(userId),
        products: [],
        status: "Pending",
      });
    }

    // 🔹 Check if product already exists in cart with same size
    const existingItem = order.products.find(
      (item: any) =>
        item.collection.toString() === productId.toString() &&
        (size ? item.size === size : true)
    );

    if (existingItem) {
      // If found, update quantity
      existingItem.quantity += quantity;
    } else {
      // Otherwise push new product to cart
      order.products.push({
        collection: new mongoose.Types.ObjectId(productId),
        size: size || null,
        quantity,
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      cart: order,
    });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
