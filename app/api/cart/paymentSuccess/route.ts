import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Cart from "@/lib/models/Cart"; // ✅ You forgot this import earlier

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      products,
      cartId,
    } = body;

    // ============================
    // 1️⃣ VERIFY RAZORPAY SIGNATURE
    // ============================
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ============================
    // 2️⃣ CALCULATE TOTAL PRICE
    // ============================
    const totalPrice = products.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // ============================
    // 3️⃣ CREATE ORDER RECORD
    // ============================
    const newOrder = await Order.create({
      user: userId,
      products,
      totalPrice,
      paymentId: razorpay_payment_id,
      status: "Order placed", // ✅ must be 1 of enum values
    });

    // ============================
    // 4️⃣ EMPTY CART (if exists)
    // ============================
    if (cartId) {
      await Cart.findByIdAndUpdate(cartId, { products: [] });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified & order created",
      order: newOrder,
    });
  } catch (error) {
    console.error("PAYMENT SUCCESS ERROR:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
