import mongoose, { Schema, Document, Model } from "mongoose";

// --- INTERFACES ---
export interface IOrderProduct {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId; // ✅ changed from `collection`
  size?: string;
  quantity: number;
  price?: number;
  name?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | string;
  products: IOrderProduct[];
  status: "Pending" | "Order placed" | "Out for delivery" | "Delivered" | "Canceled";
  totalPrice?: number;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMAS ---
const OrderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Collections", required: true },
    size: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number },
    name: { type: String },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.Mixed, required: true },
    products: { type: [OrderProductSchema], required: true },
    status: {
      type: String,
      enum: ["Pending", "Order placed", "Out for delivery", "Delivered", "Canceled"],
      default: "Pending",
    },
    totalPrice: { type: Number, default: 0 },
    paymentId: { type: String },
  },
  { timestamps: true }
);

// --- MODEL EXPORT ---
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
