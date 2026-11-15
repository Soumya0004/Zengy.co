import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const address =
      typeof body?.address === "string" ? body.address.trim() : "";

    if (
      !name ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !address ||
      address.length > 500 ||
      Buffer.byteLength(password, "utf8") < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { error: "Enter valid signup details and a password of 8 to 72 bytes" },
        { status: 400 }
      );
    }

    await dbConnect();
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
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === 11000
    ) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    console.error("Signup Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
