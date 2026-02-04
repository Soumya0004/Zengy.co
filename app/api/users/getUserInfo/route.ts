import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import Collections from "@/lib/models/Collections";

export async function GET() {
  try {
    // 1️⃣ Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2️⃣ Connect to MongoDB
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error("DB connection error:", dbErr);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // 3️⃣ Fetch user info
    let user;
    try {
      user = await User.findById(userId)
        .populate("favourites") // assuming favourites ref correct
        .populate({
          path: "cart.product",
          model: "Collections",
          select: "img title price sizes rating category", // limit fields
        })
        .lean();
    } catch (userErr) {
      console.error("Error fetching user:", userErr);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Fetch user orders safely
    let orders: any[] = [];
    try {
      const rawOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

      // Only populate valid references
      orders = await Promise.all(
        rawOrders.map(async (order) => {
          const products = await Promise.all(
            order.products.map(async (p: any) => {
              if (!p.collection) return p; // skip if no collection
              const coll = await Collections.findById(p.collection)
                .select("img title price sizes rating category")
                .lean();
              return { ...p, collection: coll || null };
            })
          );
          return { ...order, products };
        })
      );
    } catch (orderErr) {
      console.error("Error fetching orders:", orderErr);
      orders = []; // fallback to empty array
    }

    // 5️⃣ Return combined user + orders
    return NextResponse.json({ ...user, orders }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
