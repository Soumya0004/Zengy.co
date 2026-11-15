import { auth } from "@/auth";
import mongoose from "mongoose";

export async function getAuthenticatedUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(userId);
}
