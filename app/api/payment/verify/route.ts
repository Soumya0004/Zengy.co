import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Address from "@/lib/models/Address";
import Cart from "@/lib/models/Cart";
import { auth } from "@/auth";

// 1. Declare explicit product mapping type boundaries to remove 'any'
interface IncomingProductItem {
  productId?: string;
  _id?: string;
  quantity: number;
  price: number;
  size?: string;
  name?: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      totalPrice,
      addressId, 
    } = await req.json();

    // Validate inputs
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ success: false, error: "Valid address is required" }, { status: 400 });
    }

    // Security: Verify the address belongs to the current user
    const addressDoc = await Address.findOne({
      _id: new mongoose.Types.ObjectId(addressId),
      user: new mongoose.Types.ObjectId(session.user.id),
    });

    if (!addressDoc) {
      return NextResponse.json({ success: false, error: "Unauthorized address" }, { status: 403 });
    }

    // Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment" }, { status: 400 });
    }

    // Get User details for the order document
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User profile missing" }, { status: 404 });
    }

    // Create the Order with type constraints applied to the iterator array
    const order = await Order.create({
      user: session.user.id,
      userName: user.name,
      userEmail: user.email,
      products: (products as IncomingProductItem[]).map((p) => ({
        productId: new mongoose.Types.ObjectId(p.productId || p._id),
        quantity: p.quantity,
        price: p.price,
        size: p.size,
        name: p.name,
      })),
      totalPrice,
      paymentId: razorpay_payment_id,
      address: new mongoose.Types.ObjectId(addressId), 
      status: "Order placed",
    });

    // Clear the User's Cart
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { $set: { products: [], totalPrice: 0 } }
    );

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    console.error("VERIFY ERROR:", error);
    
    // Type checking safety patch applied for runtime validation errors
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Internal server setup verification error" }, { status: 500 });
  }
}