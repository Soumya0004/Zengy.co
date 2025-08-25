import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

// GET /api/users → fetch all users
export async function GET() {
  await dbConnect();
  try {
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users → create new user
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newUser = await User.create(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
