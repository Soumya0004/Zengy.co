import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, productId, size, quantity, price, name } = await req.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    let mongoUserId: mongoose.Types.ObjectId | string = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    }

    let order;
    if (typeof mongoUserId === "string") {
      order = await Order.findOne({ user: mongoUserId, status: "Pending" }).lean();
    } else {
      order = await Order.findOne({ user: mongoUserId, status: "Pending" }).lean();
    }

    if (!order) {
      order = new Order({ user: mongoUserId, products: [], status: "Pending" });
    }

    const existingItem = order.products.find(
      item => item.collection.toString() === productId.toString() && (size ? item.size === size : true)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      order.products.push({ collection: new mongoose.Types.ObjectId(productId), size: size || null, quantity, price, name });
    }

    await order.save();
    return NextResponse.json({ success: true, message: "Product added to cart", cart: order });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
