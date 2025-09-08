import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderProduct {
  collection: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    collection: { type: Schema.Types.ObjectId, ref: "Collections", required: true },
    size: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number },
    name: { type: String },
  },
  { _id: false }
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
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
