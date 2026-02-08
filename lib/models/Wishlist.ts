import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema<IWishlist> = new Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate wishlist entries
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
