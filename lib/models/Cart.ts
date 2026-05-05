// /lib/models/Cart.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartProduct {
  product: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  price?: number;
  name?: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  products: ICartProduct[];
  totalPrice?: number;
}

const CartProductSchema = new Schema<ICartProduct>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Collections", // MUST match your product model name
    required: true,
  },
  quantity: { type: Number, required: true },
  size: String,
  price: Number,
  name: String,
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [CartProductSchema],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);