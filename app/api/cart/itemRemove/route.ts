import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { orderId, productId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 🔥 Remove the product
    let updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $pull: { products: { _id: productId } } },
      { new: true }
    ).populate("products.collection");

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Recalculate total
    updatedOrder.totalPrice = updatedOrder.products.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
    await updatedOrder.save();

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error removing product:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
