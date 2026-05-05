import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

type SafeUser = {
  _id?: string;
  name: string;
  email: string;
};

function isPopulatedUser(user: any): user is SafeUser {
  return user && typeof user === "object" && "name" in user;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const order: any = await Order.findById(params.id)
      .populate("user", "name email")
      .populate("products.productId", "title img price")
      .populate("address")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    let userData: SafeUser;

    // ✅ CASE 1: populated
    if (isPopulatedUser(order.user)) {
      userData = order.user;
    }

    // ✅ CASE 2: ObjectId → fetch manually
    else if (order.user && mongoose.Types.ObjectId.isValid(order.user)) {
      const u: any = await User.findById(order.user)
        .select("name email")
        .lean();

      userData = u || {
        name: "Unknown",
        email: "No email",
      };
    }

    // ❌ CASE 3: missing
    else {
      userData = {
        name: "Unknown",
        email: "No email",
      };
    }

    const transformedOrder = {
      ...order,
      user: userData,
      address: order.address || "No address provided",
      products: (order.products || []).map((p: any) => ({
        ...p,
        product: p.productId || null,
      })),
    };

    return NextResponse.json({ success: true, order: transformedOrder });
  } catch (error: any) {
    console.error("❌ Admin order detail error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const order: any = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("products.productId", "title img price")
      .populate("address")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    let userData: SafeUser;

    if (isPopulatedUser(order.user)) {
      userData = order.user;
    } else if (order.user && mongoose.Types.ObjectId.isValid(order.user)) {
      const u: any = await User.findById(order.user)
        .select("name email")
        .lean();

      userData = u || {
        name: "Unknown",
        email: "No email",
      };
    } else {
      userData = {
        name: "Unknown",
        email: "No email",
      };
    }

    const transformedOrder = {
      ...order,
      user: userData,
      address: order.address || "No address provided",
      products: (order.products || []).map((p: any) => ({
        ...p,
        product: p.productId || null,
      })),
    };

    return NextResponse.json({ success: true, order: transformedOrder });
  } catch (error: any) {
    console.error("❌ Admin order update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}