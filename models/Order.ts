import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderProduct {
  collection: mongoose.Types.ObjectId; 
  size?: string;                        // made optional
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId; 
  products: IOrderProduct[];
  status: "Pending" | "Order placed" | "Out for delivery" | "Delivered" | "Canceled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    collection: {
      type: Schema.Types.ObjectId,
      ref: "Collections", 
      required: true,
    },
    size: { type: String, required: false },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: { type: [OrderProductSchema], required: true },
    status: {
      type: String,
      enum: ["Pending", "Order placed", "Out for delivery", "Delivered", "Canceled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
