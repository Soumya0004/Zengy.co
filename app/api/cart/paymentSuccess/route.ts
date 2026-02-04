import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Cart from "@/lib/models/Cart";
import Collections from "@/lib/models/Collections";

export async function POST(req: Request) {
  const session = await mongoose.startSession();

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

    let newOrder: any;

    // ============================
    // 3️⃣ START TRANSACTION
    // ============================
    await session.withTransaction(async () => {
      // -----------------------------
      // 🔹 DECREMENT STOCK
      // -----------------------------
      for (const item of products) {
        const result = await Collections.updateOne(
          {
            _id: new mongoose.Types.ObjectId(item.productId),
            "sizes.size": item.size,
            "sizes.stock": { $gte: item.quantity },
          },
          { $inc: { "sizes.$.stock": -item.quantity } },
          { session }
        );

        console.log("Stock update result:", result);

        if (result.modifiedCount === 0) {
          throw new Error(
            `Stock not available for product ${item.productId} size ${item.size}`
          );
        }
      }

      // -----------------------------
      // 🔹 CREATE ORDER
      // -----------------------------
      newOrder = await Order.create(
        [
          {
            user: userId,
            products,
            totalPrice,
            paymentId: razorpay_payment_id,
            status: "Order placed",
          },
        ],
        { session }
      );

      // -----------------------------
      // 🔹 CLEAR CART
      // -----------------------------
      if (cartId) {
        await Cart.findByIdAndUpdate(
          cartId,
          { products: [], totalPrice: 0 },
          { session }
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified, stock updated, order created & cart cleared",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("PAYMENT SUCCESS ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Order failed" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
