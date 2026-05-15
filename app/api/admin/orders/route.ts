import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

// 1. Import the model files
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Collections from "@/lib/models/Collections"; 
import Address from "@/lib/models/Address"; // Ensure this matches your file name exactly

export async function GET() {
  try {
    await dbConnect();

    const orders = await Order.find()
      .populate("user", "name email")
      // FIX: Pass the Model object (Address) directly instead of the string "address"
      .populate({
        path: "address",
        model: Address 
      })
      .populate({
        path: "products.productId",
        model: Collections, // Use the imported model object here too
        select: "title img price",
      })
      .sort({ createdAt: -1 })
      .lean();

    const transformedOrders = (orders as any[]).map((order) => {
      return {
        ...order,
        user: order.user && typeof order.user === "object" && "name" in order.user
            ? order.user
            : { name: "Deleted User", email: "N/A" },
        address: order.address || "Address info unavailable",
        products: (order.products || []).map((p: any) => ({
          ...p,
          product: p.productId || { title: "Product Unavailable", price: 0 },
        })),
      };
    });

    return NextResponse.json({ success: true, orders: transformedOrders });
  } catch (error: any) {
    console.error("ADMIN_ORDERS_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}