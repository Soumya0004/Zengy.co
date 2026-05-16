import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

// Import the model files
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Collections from "@/lib/models/Collections"; 
import Address from "@/lib/models/Address";

// 1. Declare structural interfaces for the Mongoose Lean Documents
interface LeanUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface LeanProductInfo {
  _id: mongoose.Types.ObjectId;
  title: string;
  img: string;
  price: number;
}

interface LeanOrderProduct {
  productId?: LeanProductInfo | null;
  quantity: number;
  price: number;
  [key: string]: unknown;
}

interface LeanOrderDocument {
  _id: mongoose.Types.ObjectId;
  user?: LeanUser | null;
  address?: unknown;
  products?: LeanOrderProduct[];
  totalPrice: number;
  status: string;
  createdAt: Date | string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    await dbConnect();

    // Ensure models are registered to prevent evaluation lookup loops
    const checkModels = { User, Collections, Address };

    const orders = await Order.find()
      .populate("user", "name email")
      .populate({
        path: "address",
        model: Address 
      })
      .populate({
        path: "products.productId",
        model: Collections,
        select: "title img price",
      })
      .sort({ createdAt: -1 })
      .lean<LeanOrderDocument[]>(); // Cast directly into our explicit structure

    const transformedOrders = orders.map((order) => {
      // Safely parse populated user structures
      const hasUserData = order.user && typeof order.user === "object" && "name" in order.user;
      
      return {
        ...order,
        user: hasUserData 
          ? order.user 
          : { name: "Deleted User", email: "N/A" },
        address: order.address || "Address info unavailable",
        products: (order.products || []).map((p) => ({
          ...p,
          product: p.productId || { title: "Product Unavailable", price: 0 },
        })),
      };
    });

    return NextResponse.json({ success: true, orders: transformedOrders });
  } catch (error: unknown) {
    console.error("ADMIN_ORDERS_GET_ERROR:", error);
    
    // Fallback parsing pattern to accommodate type-safety rules on unknown catch errors
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}