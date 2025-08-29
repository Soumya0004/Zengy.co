import mongoose, { Schema, Document, Model } from "mongoose";

// --- INTERFACES ---
export interface ISizeStock {
  size: string;
  stock: number;
}

export interface ICollection extends Document {
  img: string;
  title: string;
  price: number;
  sizes: ISizeStock[];
  rating?: number;
  category: string;
  availability?: string; // virtual

  getStock: (size: string) => number;
  availableSizes: () => string[];
}

// --- SCHEMAS ---
const SizeStockSchema = new Schema<ISizeStock>(
  {
    size: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    img: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    sizes: { type: [SizeStockSchema], required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- VIRTUALS ---
CollectionSchema.virtual("availability").get(function (this: ICollection) {
  return this.sizes.some((s) => s.stock > 0) ? "In Stock" : "Out of Stock";
});

// --- INSTANCE METHODS ---
CollectionSchema.methods.getStock = function (this: ICollection, size: string): number {
  const sizeInfo = this.sizes.find((s) => s.size === size);
  return sizeInfo ? sizeInfo.stock : 0;
};

CollectionSchema.methods.availableSizes = function (this: ICollection): string[] {
  return this.sizes.filter((s) => s.stock > 0).map((s) => s.size);
};

// --- MODEL EXPORT ---
const Collections =
  (mongoose.models.Collections as Model<ICollection>) ||
  mongoose.model<ICollection>("Collections", CollectionSchema);

export default Collections;
