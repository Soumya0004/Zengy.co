import mongoose, { Schema, Document, Model } from "mongoose";

/* ================= INTERFACES ================= */

export interface ISizeStock {
  size: string;
  stock: number;
}

export interface ICollection extends Document {
  img: string;
  title: string;
  price: number;
  category: string;
  rating?: number;

  sizes: ISizeStock[];

  availability?: string;

  getStock(size: string): number;
  availableSizes(): string[];
}

/* ================= SCHEMA ================= */

const SizeStockSchema = new Schema<ISizeStock>({
  size: { type: String, required: true, trim: true },
  stock: { type: Number, default: 0, min: 0 },
});

const CollectionSchema = new Schema<ICollection>(
  {
    img: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // ⭐ ALWAYS USED
    sizes: { type: [SizeStockSchema], required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ================= VIRTUAL ================= */

CollectionSchema.virtual("availability").get(function (this: ICollection) {
  return this.sizes.some((s) => s.stock > 0) ? "In Stock" : "Out of Stock";
});

/* ================= METHODS ================= */

CollectionSchema.methods.getStock = function (size: string) {
  const found = this.sizes.find((s: ISizeStock) => s.size === size);
  return found ? found.stock : 0;
};

CollectionSchema.methods.availableSizes = function () {
  return this.sizes.filter((s: { stock: number; }) => s.stock > 0).map((s: { size: any; }) => s.size);
};

/* ================= MODEL ================= */

const Collections: Model<ICollection> =
  mongoose.models.Collections ||
  mongoose.model<ICollection>("Collections", CollectionSchema);

export default Collections;