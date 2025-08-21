import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/app/Component/Collection";
import Collections from "@/models/Collections";

// ✅ Get single collection by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const collection = await Collections.findById(params.id);

    if (!collection) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
