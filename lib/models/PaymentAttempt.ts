import { Schema, models, model, InferSchemaType } from "mongoose";

const PaymentAttemptSchema = new Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Collections",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        size: String,
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    paymentId: { type: String, sparse: true, unique: true },
    status: {
      type: String,
      enum: ["created", "processing", "paid"],
      default: "created",
      required: true,
    },
  },
  { timestamps: true }
);

export type IPaymentAttempt = InferSchemaType<typeof PaymentAttemptSchema>;
export default models.PaymentAttempt ||
  model<IPaymentAttempt>("PaymentAttempt", PaymentAttemptSchema);
