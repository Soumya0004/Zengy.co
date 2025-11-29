import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import "@/lib/models/Collections";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch user basic info, favourites, and cart
    const user = await User.findById(session.user.id)
      .populate("favourites")
      .populate({
        path: "cart.product",
        model: "Collections",
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch orders from Order collection
    const orders = await Order.find({ user: session.user.id })
      .populate({
        path: "products.collection",
        model: "Collections",
      })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    return NextResponse.json(
      {
        ...user,
        orders, // attach orders to user
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
