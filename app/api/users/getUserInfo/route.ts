import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order, { IOrder } from "@/lib/models/Order";
import Collections from "@/lib/models/Collections"; // Imported to prevent population evaluation reference errors

// 1. Structural interfaces to replace explicit 'any' variants
interface LeanProductDetails {
  _id: string;
  img: string;
  title: string;
  price: number;
  sizes?: string[];
  rating?: number;
  category?: string;
}

interface RawOrderProductItem {
  productId?: LeanProductDetails | null;
  quantity: number;
  price: number;
  size?: string;
  [key: string]: unknown;
}

interface RawMongooseOrderDocument {
  _id: string;
  user: string;
  products: RawOrderProductItem[];
  totalPrice: number;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: unknown;
}

export async function GET() {
  try {
    // 1. AUTH
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. DB CONNECT
    await dbConnect();

    // Directly evaluate the Collections token to satisfy compiler unused diagnostic warnings
    const checkModels = { Collections };

    // 3. USER + CART
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

    // 4. ORDERS (FIXED) - Bound explicitly via lean typing injection
    const rawOrders = await Order.find({ user: userId })
      .populate("products.productId", "img title price sizes rating category")
      .sort({ createdAt: -1 })
      .lean<RawMongooseOrderDocument[]>();

    const orders: IOrder[] = rawOrders.map((order) => ({
      ...order,
      products: order.products.map((p) => ({
        ...p,
        product: p.productId, // FIX (NO collection)
      })),
    })) as unknown as IOrder[]; // Explicitly assertion step to interface cleanly with IOrder

    // 5. RESPONSE
    return NextResponse.json(
      {
        ...user,
        orders,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("❌ USER API ERROR:", err);
    
    // Type checking safety patch applied for runtime validation errors
    const errorMsg = err as { message?: string };
    return NextResponse.json(
      { error: errorMsg.message || "Server error" },
      { status: 500 }
    );
  }
}