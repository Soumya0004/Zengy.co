import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "products.productId",
        select: "title img price",
      })
      .populate("address") // ✅ Added population for address
      .sort({ createdAt: -1 })
      .lean();

    const missingUserIds = orders
      .map((o: any) => o.user)
      .filter((user: any) =>
        user && (typeof user === "string" || typeof user === "object") &&
        !Object.prototype.hasOwnProperty.call(user, "name")
      )
      .map((user: any) => user.toString())
      .filter(Boolean);

    let usersMap: Record<string, any> = {};

    if (missingUserIds.length > 0) {
      const users = await User.find({
        _id: { $in: missingUserIds.map((id: any) => new mongoose.Types.ObjectId(id)) },
      }).select("name email").lean();

      usersMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u]));
    }

    const transformedOrders = (orders as any[]).map((order) => {
      let userData;
      if (order.user && typeof order.user === "object" && Object.prototype.hasOwnProperty.call(order.user, "name")) {
        userData = order.user;
      } else if (order.user && usersMap[order.user.toString()]) {
        userData = usersMap[order.user.toString()];
      } else {
        userData = { name: "Unknown", email: "No email" };
      }

      return {
        ...order,
        user: userData,
        // Ensure address is handled if it's missing from DB
        address: order.address || "No address provided", 
        products: (order.products || []).map((p: any) => ({
          ...p,
          product: p.productId || null,
        })),
      };
    });

    return NextResponse.json({ success: true, orders: transformedOrders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}