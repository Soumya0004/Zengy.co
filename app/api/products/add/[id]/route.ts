import { dbConnect } from "@/lib/mongodb";
import Collections from "@/models/Collections";
import { NextResponse } from "next/server";

// POST /api/products
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { img, title, price, stock, rating, category } = body;

    if (!img || !title || !price || stock === undefined || !category) {
      return NextResponse.json(
        { error: "All required fields (img, title, price, stock, category) must be provided" },
        { status: 400 }
      );
    }

    const newProduct = new Collections({
      img,
      title,
      price,
      stock,
      rating: rating || 0,
      category,
      availability: Number(stock) > 0 ? "in stock" : "out of stock", 
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Product added successfully", product: newProduct },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error adding product:", err);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
