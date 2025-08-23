import { NextResponse } from "next/server";
import Collections from "@/models/Collections";
import { dbConnect } from "@/lib/mongodb";

// ✅ GET all collections
export async function GET() {
  try {
    await dbConnect();
    const collections = await Collections.find().sort({ createdAt: -1 });
    return NextResponse.json(collections);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// ✅ POST new collection
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { img, title, price, rating, category } = body;

    const newCollection = new Collections({ img, title, price, rating, category });
    await newCollection.save();

    return NextResponse.json(newCollection, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
