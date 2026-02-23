import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order, { IOrder } from "@/lib/models/Order";

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
    let orders: IOrder[] = [];
    try {
      const rawOrders = await Order.find({ user: userId })
        .populate('products.productId', 'img title price sizes rating category')
        .sort({ createdAt: -1 })
        .lean();

      // Rename productId to collection for consistency
      orders = rawOrders.map(order => ({
        ...order,
        products: order.products.map(p => {
          const { productId, ...rest } = p;
          return {
            ...rest,
            collection: productId
          };
        })
      })) as unknown as IOrder[];
    } catch (orderErr) {
      console.error("Error fetching orders:", orderErr);
      orders = []; // fallback to empty array
    }

    // 5️⃣ Return combined user + orders
    return NextResponse.json({ ...user, orders }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}
