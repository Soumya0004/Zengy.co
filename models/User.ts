import mongoose, { Schema, models, model, InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
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
  cart: [{ type: mongoose.Types.ObjectId, ref: "Collection" }],
  orders: [{ type: mongoose.Types.ObjectId, ref: "order" }],
}, { timestamps: true });

export type IUser = InferSchemaType<typeof UserSchema>;

export default models.User || model<IUser>("User", UserSchema);
