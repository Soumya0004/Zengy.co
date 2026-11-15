import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import { buildCheckoutQuote, CheckoutValidationError } from "@/lib/checkout";
import Address from "@/lib/models/Address";
import Cart, { ICartProduct } from "@/lib/models/Cart";
import Collections from "@/lib/models/Collections";
import PaymentAttempt from "@/lib/models/PaymentAttempt";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay credentials are not configured");
      return NextResponse.json(
        { error: "Payment service is unavailable" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const addressId = body?.addressId;
    if (
      typeof addressId !== "string" ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      return NextResponse.json(
        { error: "A valid delivery address is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const address = await Address.exists({ _id: addressId, user: userId });
    if (!address) {
      return NextResponse.json(
        { error: "Delivery address not found" },
        { status: 404 }
      );
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = cart.products.map(
      (item: ICartProduct) => item.product
    );
    const products = await Collections.find({ _id: { $in: productIds } }).lean();
    const quote = buildCheckoutQuote(
      cart.products.map((item: ICartProduct) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
        size: item.size,
      })),
      products.map((product) => ({
        id: product._id.toString(),
        title: product.title,
        price: product.price,
        sizes: product.sizes,
      }))
    );

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const order = await razorpay.orders.create({
      amount: Math.round(quote.totalPrice * 100),
      currency: "INR",
      receipt: `order_${Date.now()}_${userId.toString().slice(-6)}`,
    });

    await PaymentAttempt.create({
      razorpayOrderId: order.id,
      user: userId,
      address: new mongoose.Types.ObjectId(addressId),
      products: quote.products.map((item) => ({
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId),
      })),
      totalPrice: quote.totalPrice,
    });

    return NextResponse.json({
      success: true,
      order,
      totalPrice: quote.totalPrice,
    });
  } catch (error: unknown) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Payment order creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create payment order" },
      { status: 500 }
    );
  }
}
