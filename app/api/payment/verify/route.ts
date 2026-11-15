import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import { signaturesMatch } from "@/lib/checkout";
import Cart from "@/lib/models/Cart";
import Order from "@/lib/models/Order";
import PaymentAttempt from "@/lib/models/PaymentAttempt";
import User from "@/lib/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay credentials are not configured");
      return NextResponse.json(
        { success: false, error: "Payment service is unavailable" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = body ?? {};
    if (
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string" ||
      razorpayOrderId.length > 100 ||
      razorpayPaymentId.length > 100
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment details" },
        { status: 400 }
      );
    }

    await dbConnect();
    const attempt = await PaymentAttempt.findOne({
      razorpayOrderId,
      user: userId,
    });
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [gatewayOrder, paymentList] = await Promise.all([
      razorpay.orders.fetch(razorpayOrderId),
      razorpay.orders.fetchPayments(razorpayOrderId),
    ]);
    const payment = paymentList.items.find(
      (item) => item.id === razorpayPaymentId
    );
    const expectedAmount = Math.round(attempt.totalPrice * 100);
    if (
      gatewayOrder.status !== "paid" ||
      gatewayOrder.amount !== expectedAmount ||
      gatewayOrder.currency !== "INR" ||
      !payment ||
      payment.order_id !== razorpayOrderId ||
      payment.status !== "captured" ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { success: false, error: "Payment has not been captured" },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findOne({ paymentId: razorpayPaymentId });
    if (existingOrder) {
      if (existingOrder.user.toString() !== userId.toString()) {
        return NextResponse.json(
          { success: false, error: "Payment is already associated with another order" },
          { status: 409 }
        );
      }

      await Promise.all([
        Cart.findOneAndUpdate(
          { user: userId },
          { $set: { products: [], totalPrice: 0 } }
        ),
        PaymentAttempt.updateOne(
          { _id: attempt._id },
          { $set: { status: "paid", paymentId: razorpayPaymentId } }
        ),
      ]);
      return NextResponse.json({ success: true, order: existingOrder });
    }

    const claimedAttempt = await PaymentAttempt.findOneAndUpdate(
      { _id: attempt._id, status: "created" },
      { $set: { status: "processing", paymentId: razorpayPaymentId } },
      { new: true }
    );
    if (!claimedAttempt) {
      return NextResponse.json(
        { success: false, error: "Payment verification is already in progress" },
        { status: 409 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      await PaymentAttempt.updateOne(
        { _id: attempt._id, status: "processing" },
        { $set: { status: "created" }, $unset: { paymentId: 1 } }
      );
      return NextResponse.json(
        { success: false, error: "User profile missing" },
        { status: 404 }
      );
    }

    let order;
    try {
      order = await Order.create({
        user: userId,
        userName: user.name,
        userEmail: user.email,
        products: attempt.products,
        totalPrice: attempt.totalPrice,
        paymentId: razorpayPaymentId,
        address: attempt.address,
        status: "Order placed",
      });
    } catch (error) {
      await PaymentAttempt.updateOne(
        { _id: attempt._id, status: "processing" },
        { $set: { status: "created" }, $unset: { paymentId: 1 } }
      );
      throw error;
    }

    await Promise.all([
      Cart.findOneAndUpdate(
        { user: userId },
        { $set: { products: [], totalPrice: 0 } }
      ),
      PaymentAttempt.updateOne(
        { _id: attempt._id, status: "processing" },
        { $set: { status: "paid" } }
      ),
    ]);

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify payment" },
      { status: 500 }
    );
  }
}
