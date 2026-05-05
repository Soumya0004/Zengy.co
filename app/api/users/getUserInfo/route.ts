import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order, { IOrder } from "@/lib/models/Order";

export async function GET() {
  try {
    // ✅ 1. AUTH
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ✅ 2. DB CONNECT
    await dbConnect();

    // ✅ 3. USER + CART
    const user = await User.findById(userId)
      .populate("favourites")
      .populate({
        path: "cart.product",
        model: "Collections",
        select: "img title price sizes rating category",
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ 4. ORDERS (FIXED)
    const rawOrders = await Order.find({ user: userId })
      .populate("products.productId", "img title price sizes rating category")
      .sort({ createdAt: -1 })
      .lean();

    const orders: IOrder[] = rawOrders.map((order: any) => ({
      ...order,
      products: order.products.map((p: any) => ({
        ...p,
        product: p.productId, // ✅ FIX (NO collection)
      })),
    }));

    // ✅ 5. RESPONSE
    return NextResponse.json(
      {
        ...user,
        orders,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ USER API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}