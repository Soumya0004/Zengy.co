import { dbConnect } from "@/lib/mongodb";
import Collections from "@/lib/models/Collections";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const summaries = await Collections.aggregate([
      {
        $match: {
          category: { $type: "string", $nin: ["", null] },
        },
      },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          products: {
            $topN: {
              output: {
                _id: "$_id",
                title: "$title",
                price: "$price",
                img: "$img",
              },
              sortBy: { createdAt: -1, _id: -1 },
              n: 4,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          productCount: 1,
          products: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);
    const categorySummaries = summaries.filter(
      (summary) => summary.name.trim() !== ""
    );
    const categories = categorySummaries.map((summary) => summary.name);

    return NextResponse.json({
      success: true,
      categories,
      categorySummaries,
      count: categories.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}