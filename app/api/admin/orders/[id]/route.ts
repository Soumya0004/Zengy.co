import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

// 1. CRITICAL: Register all models for population
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Collections from "@/lib/models/Collections"; 
import Address from "@/lib/models/Address";

type SafeUser = {
  _id?: string;
  name: string;
  email: string;
};

// Helper to handle the common transformation logic for both GET and PUT
const transformOrderData = (order: any) => {
  return {
    ...order,
    user: (order.user && typeof order.user === "object" && "name" in order.user)
      ? order.user
      : { name: "Unknown", email: "No email" },
    address: order.address || "No address provided",
    products: (order.products || []).map((p: any) => ({
      ...p,
      product: p.productId || null,
    })),
  };
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const order = await Order.findById(params.id)
      .populate("user", "name email")
      .populate({
        path: "products.productId",
        model: "Collections" // Matches the name in your Collection model file
      })
      .populate("address")
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      order: transformOrderData(order) 
    });

  } catch (error: any) {
    console.error("❌ Admin order detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate({
        path: "products.productId",
        model: "Collections"
      })
      .populate("address")
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      order: transformOrderData(order) 
    });

  } catch (error: any) {
    console.error("❌ Admin order update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}