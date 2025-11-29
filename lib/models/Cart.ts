import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartProduct {
  collection: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  price?: number;
  name?: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId | string;
  products: ICartProduct[];
}

const CartProductSchema = new Schema<ICartProduct>(
  {
    collection: { type: Schema.Types.ObjectId, ref: "Collections", required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    price: { type: Number },
    name: { type: String },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [CartProductSchema],
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
