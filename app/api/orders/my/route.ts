import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { auth } from "@/auth";
import mongoose from "mongoose";

// 1. Declare structural interfaces for the Mongoose Lean Documents to eliminate 'any'
interface PopulatedProductInfo {
  _id: string | mongoose.Types.ObjectId;
  title: string;
  img: string;
  price: number;
}

interface OrderItem {
  productId?: PopulatedProductInfo | null;
  quantity: number;
  price: number;
  [key: string]: unknown;
}

interface LeanUserOrder {
  _id: string | mongoose.Types.ObjectId;
  user: string | mongoose.Types.ObjectId;
  products?: OrderItem[];
  totalPrice: number;
  status: string;
  address?: unknown;
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: unknown;
}

export async function GET() {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const userId = session.user.id;

    // HANDLE BOTH string + ObjectId
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
      .populate("address") // for showing address
      .sort({ createdAt: -1 })
      .lean<LeanUserOrder[]>(); // Directly specify our lean payload type mapping here

    const transformed = orders.map((order) => ({
      ...order,
      products: (order.products || []).map((p) => ({
        ...p,
        product:
          p.productId && typeof p.productId === "object"
            ? p.productId
            : null,
      })),
    }));

    return NextResponse.json({ success: true, orders: transformed });
  } catch (err: unknown) {
    console.error("ORDER FETCH ERROR:", err);
    const errorPayload = err as { message?: string };
    return NextResponse.json(
      { success: false, error: errorPayload.message || "Failed to fetch user orders" },
      { status: 500 }
    );
  }
}