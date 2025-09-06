import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
  try {
    await dbConnect();

    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    //  Get userId
    let userId = session.user.id;
    if (!userId && session.user.email) {
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      userId = user._id;
    }

    //  Populate the correct field: products.collection
    const cart = await Order.findOne({ user: userId, status: "Pending" })
      .populate("products.collection");

    if (!cart) {
      return NextResponse.json({ success: true, cart: { products: [] } });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error("Error fetching cart:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
