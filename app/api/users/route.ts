import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

// GET /api/users → fetch all users
export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Get Users Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users → create new user
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // avoid duplicate emails
    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const newUser = await User.create(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
