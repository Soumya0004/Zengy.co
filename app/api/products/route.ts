import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Collections from "@/models/Collections";
import { dbConnect } from "@/lib/mongodb";

// 🟢 GET all products
export async function GET() {
  try {
    await dbConnect();

    const products = await Collections.find().sort({ createdAt: -1 }); // latest first

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 POST add product
export async function POST(req: Request) {
  try {
    await dbConnect();

    const formData = await req.formData();

    const file = formData.get("img") as File;
    const title = formData.get("title") as string;
    const price = Number(formData.get("price"));
    const category = formData.get("category") as string;
    const rating = Number(formData.get("rating")) || 0;

    if (!file || !title || !price || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
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

    // Save product in MongoDB
    const newProduct = await Collections.create({
      img: uploadResult.secure_url,
      title,
      price,
      category,
      rating,
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
