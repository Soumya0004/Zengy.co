import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

// Register all models for population
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Collections from "@/lib/models/Collections"; 
import Address from "@/lib/models/Address";

// Explicit data schemas to replace 'any' definitions
interface PopulatedUser {
  _id?: string;
  name: string;
  email: string;
}

interface PopulatedProductItem {
  _id: string;
  title: string;
  img: string;
  price: number;
}

interface OrderProductPayload {
  productId?: PopulatedProductItem | null;
  quantity: number;
  price: number;
  [key: string]: unknown;
}

interface RawMongooseOrder {
  _id: mongoose.Types.ObjectId | string;
  user?: PopulatedUser | null;
  address?: unknown;
  products?: OrderProductPayload[];
  totalPrice: number;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: unknown;
}

// Helper to handle the common transformation logic safely without explicit 'any' types
const transformOrderData = (order: RawMongooseOrder) => {
  const isUserValid = order.user && typeof order.user === "object" && "name" in order.user;
  
  return {
    ...order,
    user: isUserValid
      ? order.user
      : { name: "Unknown", email: "No email" },
    address: order.address || "No address provided",
    products: (order.products || []).map((p) => ({
      ...p,
      product: p.productId || null,
    })),
  };
};

// Next.js 15 requires params to be evaluated asynchronously as a Promise wrapper
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;

    // Evaluated directly to satisfy typescript file check warnings
    const models = { User, Collections, Address };

    const order = await Order.findById(resolvedParams.id)
      .populate("user", "name email")
      .populate({
        path: "products.productId",
        model: Collections
      })
      .populate({
        path: "address",
        model: Address
      })
      .lean<RawMongooseOrder | null>();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      order: transformOrderData(order) 
    });

  } catch (error: unknown) {
    console.error("❌ Admin order detail error:", error);
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      resolvedParams.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate({
        path: "products.productId",
        model: Collections
      })
      .populate({
        path: "address",
        model: Address
      })
      .lean<RawMongooseOrder | null>();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      order: transformOrderData(order) 
    });

  } catch (error: unknown) {
    console.error("❌ Admin order update error:", error);
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Internal Server Error" }, { status: 500 });
  }
}