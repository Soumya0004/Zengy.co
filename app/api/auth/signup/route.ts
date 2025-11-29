import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, address } = await req.json();

    // Validate fields
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },       
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        user: { id: user._id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup Error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
