import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      payment_capture: true,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.log("ORDER ERROR:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
