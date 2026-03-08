/**
 * Seed script to add sample "Sale" products to the database.
 *
 * Usage:
 *   MONGO_URI="your_mongo_uri" node scripts/seedSaleProducts.js
 *
 * It will upsert products by title, so you can rerun without duplicates.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Collections from "@/lib/models/Collections";

dotenv.config();

const products = [
  {
    title: "Sail-Ready Voyager Jacket",
    description: "Lightweight windbreaker built for open-water adventures.",
    price: 4999,
    discount: 25,
    category: "Sail",
    rating: 4.6,
    img: "https://res.cloudinary.com/demo/image/upload/v1680000000/sail-jacket.jpg",
    sizes: [
      { size: "S", stock: 12 },
      { size: "M", stock: 10 },
      { size: "L", stock: 8 },
    ],
  },
  {
    title: "OceanGrip Sailing Gloves",
    description: "High-traction gloves for secure handling on deck.",
    price: 1299,
    discount: 30,
    category: "Sail",
    rating: 4.8,
    img: "https://res.cloudinary.com/demo/image/upload/v1680000000/sailing-gloves.jpg",
    sizes: [
      { size: "S", stock: 20 },
      { size: "M", stock: 18 },
      { size: "L", stock: 15 },
    ],
  },
  {
    title: "Nautica Performance Sailing Hat",
    description: "Quick-dry hat with UV protection and adjustable fit.",
    price: 899,
    discount: 40,
    category: "Sail",
    rating: 4.5,
    img: "https://res.cloudinary.com/demo/image/upload/v1680000000/sailing-hat.jpg",
    sizes: [{ size: "One Size", stock: 25 }],
  },
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI environment variable.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  for (const product of products) {
    const existing = await Collections.findOne({ title: product.title });
    if (existing) {
      await Collections.updateOne({ _id: existing._id }, { $set: product });
      console.log(`Updated product: ${product.title}`);
    } else {
      await Collections.create(product);
      console.log(`Created product: ${product.title}`);
    }
  }

  console.log("✅ Seed complete. Sale products are available.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
