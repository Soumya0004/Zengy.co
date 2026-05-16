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
    ...authConfig.providers, // Spread Google provider from authConfig
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await User.findOne({ email: credentials.email }).lean<{
          _id: unknown;
          email: string;
          name?: string;
          avatar?: string;
          role?: string;
          password?: string;
        } | null>();

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
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

          (user as any).role = existingUser.role;
          (user as any).id = existingUser._id.toString();
        }

        return true;
      } catch (err) {
        console.error("Sign-in error:", err);
        return false;
      }
    },
  },
});