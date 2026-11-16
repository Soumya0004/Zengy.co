import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Collections from "@/lib/models/Collections";
import { dbConnect } from "@/lib/mongodb";
import {
  findProductPage,
  parseProductPagination,
} from "@/lib/product-query";

//  POST = Add product
export async function POST(req: Request) {
  try {
    await dbConnect();

    let img: string;
    let title: string;
    let price: number;
    let sizes: { size: string; stock: number }[];
    let category: string;
    let rating: number = 0;
    let discount: number = 0;
    let description: string;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await req.formData();

      const file = formData.get("img") as File | null;
      title = (formData.get("title") as string) || "";
      price = Number(formData.get("price"));
      category = (formData.get("category") as string) || "";
      rating = Number(formData.get("rating")) || 0;
      description = (formData.get("description") as string) || "";
      discount = Number(formData.get("discount")) || 0;

      // Parse sizes
      const sizesData = formData.get("sizes") as string;
      let parsedSizes;
      if (sizesData) {
        try {
          parsedSizes = JSON.parse(sizesData);
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON in sizes field. Please check the sizes array format." },
            { status: 400 }
          );
        }
      } else {
        parsedSizes = [];
      }

      // ⭐ NORMALIZATION
      let normalizedSizes;

      if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
        normalizedSizes = parsedSizes;
      } else {
        // simple product
        const stock = Number(formData.get("stock")) || 0;
        normalizedSizes = [{ size: "default", stock }];
      }

      sizes = normalizedSizes;

      if (!file || !title || !price || !category) {
        return NextResponse.json(
          {
            error:
              "img, title, price, category required",
          },
          { status: 400 },
        );
      }

      // Upload image to Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          },
        );
        stream.end(buffer);
      });

      img = uploadResult.secure_url;
    } else {
      // Handle JSON request
      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON in request body. Please check for trailing commas or syntax errors." },
          { status: 400 }
        );
      }

      img = body.img;
      title = body.title;
      price = Number(body.price);
      category = body.category;
      rating = Number(body.rating) || 0;
      description = body.description || "";
      discount = Number(body.discount) || 0;

      // ⭐ NORMALIZATION (PERMANENT FIX)
      let normalizedSizes;

      if (Array.isArray(body.sizes) && body.sizes.length > 0) {
        normalizedSizes = body.sizes;
      } else {
        // simple product
        normalizedSizes = [{ size: "default", stock: body.stock || 0 }];
      }

      sizes = normalizedSizes;

      if (!img || !title || !price || !category) {
        return NextResponse.json(
          {
            error:
              "img, title, price, category required",
          },
          { status: 400 },
        );
      }
    }

    // Save product
    const newProduct = await Collections.create({
      img,
      title,
      price,
      category,
      rating,
      discount: typeof discount === "number" ? discount : 0,
      sizes,
      description,
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Add product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET = Fetch a product page
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pagination = parseProductPagination(url.searchParams);

    if (!pagination) {
      return NextResponse.json(
        { error: "page must be a positive integer and limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    await dbConnect();

    const category = url.searchParams.get("category")?.trim();
    const search = url.searchParams.get("search")?.trim();
    const includeDetails = url.searchParams.get("admin") === "1";
    const filter: Record<string, unknown> = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escapedSearch, $options: "i" };
    }

    const result = await findProductPage(
      filter,
      pagination.page,
      pagination.limit,
      includeDetails
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
