import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const userId = session.user.id;

    // ✅ HANDLE BOTH string + ObjectId (MAIN FIX)
    const query = mongoose.Types.ObjectId.isValid(userId)
      ? {
          $or: [
            { user: userId }, // string match
            { user: new mongoose.Types.ObjectId(userId) }, // ObjectId match
          ],
        }
      : { user: userId };

    const orders = await Order.find(query)
      .populate("products.productId", "title img price")
      .populate("address") // ✅ for showing address
      .sort({ createdAt: -1 })
      .lean();

    const transformed = (orders as any[]).map((order) => ({
      ...order,
      products: (order.products || []).map((p: any) => ({
        ...p,
        product:
          p.productId && typeof p.productId === "object"
            ? p.productId
            : null,
      })),
    }));

    return NextResponse.json({ success: true, orders: transformed });
  } catch (err: any) {
    console.error("ORDER FETCH ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}