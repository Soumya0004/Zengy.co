import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  size?: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  products: IOrderProduct[];
  totalPrice: number;
  paymentId: string;
  status: "Pending" | "Order placed" | "Out for delivery" | "Delivered" | "Canceled";
  address: mongoose.Types.ObjectId; // Reference to the Address model
  createdAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
  productId: { type: Schema.Types.ObjectId, ref: "Collections", required: true },
  size: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    products: { type: [OrderProductSchema], required: true },
    totalPrice: { type: Number, required: true },
    paymentId: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Order placed", "Out for delivery", "Delivered", "Canceled"],
      default: "Order placed",
    },
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true }, // Links order to selected address
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);