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

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await req.formData();

      const file = formData.get("img") as File | null;
      title = (formData.get("title") as string) || "";
      price = Number(formData.get("price"));
      category = (formData.get("category") as string) || "";
      rating = Number(formData.get("rating")) || 0;

      // Parse sizes
      const sizesData = formData.get("sizes") as string;
      sizes = sizesData ? JSON.parse(sizesData) : [];

      if (!file || !title || !price || !category || !sizes?.length) {
        return NextResponse.json(
          { error: "All fields are required (img, title, price, category, sizes)" },
          { status: 400 }
        );
      }

      // Upload image to Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      img = uploadResult.secure_url;
    } else {
      // Handle JSON request
      const body = await req.json();

      img = body.img;
      title = body.title;
      price = Number(body.price);
      category = body.category;
      rating = Number(body.rating) || 0;
      sizes = body.sizes || [];

      if (!img || !title || !price || !category || !sizes?.length) {
        return NextResponse.json(
          { error: "All fields are required (img, title, price, category, sizes)" },
          { status: 400 }
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
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
