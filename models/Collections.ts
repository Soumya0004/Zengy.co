import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  img: string;
  title: string;
  price: number;
  rating: number;
  category: string;
}

const CollectionSchema: Schema = new Schema(
  {
    img: {
      type: String,
      required: true, // image URL
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);
