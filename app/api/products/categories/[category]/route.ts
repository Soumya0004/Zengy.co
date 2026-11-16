import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";
import {
  findProductPage,
  parseProductPagination,
} from "@/lib/product-query";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const pagination = parseProductPagination(new URL(req.url).searchParams);
    if (!pagination) {
      return NextResponse.json(
        { error: "page must be a positive integer and limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const category = resolvedParams.category.trim();
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await findProductPage(
      { category },
      pagination.page,
      pagination.limit
    );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Category fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: rawCategory } = await params;
    const category = rawCategory.trim();
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await Collections.updateMany(
      { category },
      { $set: { category: "" } },
      { collation: { locale: "en", strength: 2 } }
    );

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount,
    });
  } catch (error: unknown) {
    console.error("Category update error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}