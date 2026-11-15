import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      loginType?: string;
      email?: string;
      name?: string;
      image?: string;
      role?: string;
    };
  }
  interface JWT {
    loginType?: string;
    role?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers, 
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";
        if (!email || email.length > 254 || !password || password.length > 1024) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email }).lean<{
          _id: unknown;
          email: string;
          name?: string;
          avatar?: string;
          role?: string;
          password?: string;
        } | null>();

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          image: user.avatar || null,
          role: user.role || "user",
          loginType: "credentials",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      try {
        await dbConnect();

        if (account?.provider === "google") {
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              avatar:
                user.image ||
                "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
              role: "user",
              cart: [],
              favourites: [],
              orders: [],
            });
          }

          const googleUser = user as typeof user & { role?: string };
          googleUser.role = existingUser.role;
          googleUser.id = existingUser._id.toString();
        }

        return true;
      } catch (err) {
        console.error("Sign-in error:", err);
        return false;
      }
    },
  },
});