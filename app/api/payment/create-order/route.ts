import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // ensure number
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("🧾 RAZORPAY ORDER:", order.id);

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    console.error("❌ CREATE ORDER ERROR:", error);
    
    // Extracted type assertion to satisfy strict type-checking flags
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Order creation failed" },
      { status: 500 }
    );
  }
}