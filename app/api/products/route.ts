import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Collections from "@/lib/models/Collections";
import { dbConnect } from "@/lib/mongodb";

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

//  GET = Fetch all products
export async function GET() {
  try {
    await dbConnect();

    const products = await Collections.find().sort({ createdAt: -1 }); // latest first

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
