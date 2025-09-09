import mongoose, { Schema, models, model, InferSchemaType } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    size: { type: String },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null }, // ✅ optional for Google users
    address: { type: String, default: "" }, // ✅ optional
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    favourites: [{ type: mongoose.Types.ObjectId, ref: "Collection" }],
    cart: [CartItemSchema],
    orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof UserSchema>;

export default models.User || model<IUser>("User", UserSchema);
