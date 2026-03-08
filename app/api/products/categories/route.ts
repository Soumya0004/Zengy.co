import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const categories = await Collections.distinct("category");

    const cleanCategories = categories
      .filter((c) => c && c.trim() !== "")
      .sort();

    return NextResponse.json({
      success: true,
      categories: cleanCategories,
      count: cleanCategories.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}