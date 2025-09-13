import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Collections from "@/models/Collections"; 
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, productId, size, quantity, price, name } = await req.json();

    // ✅ Validate required fields
    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }

    // ✅ Ensure product exists and stock is available
    const collection = await Collections.findById(productId);
    if (!collection) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (collection.sizes?.length > 0) {
      const sizeStock = collection.sizes.find((s) => s.size === size);
      if (!sizeStock) {
        return NextResponse.json(
          { success: false, message: "Invalid size selected" },
          { status: 400 }
        );
      }
      if (sizeStock.stock < qty) {
        return NextResponse.json(
          { success: false, message: "Not enough stock for this size" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "This product requires sizes" },
        { status: 400 }
      );
    }

    // ✅ Convert userId
    let mongoUserId: mongoose.Types.ObjectId | string = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    }

    // ✅ Find pending cart
    let order = await Order.findOne({ user: mongoUserId, status: "Pending" });
    if (!order) {
      order = new Order({ user: mongoUserId, products: [], status: "Pending" });
    }

    // ✅ Check if product+size already exists
    const existingItem = order.products.find((item: any) => {
      const itemId = (
        item.collection instanceof mongoose.Types.ObjectId
          ? item.collection
          : item.collection?._id
      )?.toString();
      return itemId === productId.toString() && (size ? item.size === size : true);
    });

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      order.products.push({
        collection: new mongoose.Types.ObjectId(productId),
        size: size || null,
        quantity: qty,
        price,
        name,
        _id: new mongoose.Types.ObjectId(), 
      });
    }

    // ✅ Recalculate total price
    order.totalPrice = order.products.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * item.quantity,
      0
    );

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      cart: order,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
