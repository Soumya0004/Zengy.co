import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// ❌ REMOVE static database imports
// import { dbConnect } from "@/lib/mongodb";
// import User from "@/lib/models/User";

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
  trustHost: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // ✅ Dynamically import database modules inside the function (Node.js runtime)
        const { dbConnect } = await import("@/lib/mongodb");
        const User = (await import("@/lib/models/User")).default;

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

  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role || "user";
        token.loginType = (user as any).loginType || "credentials";
      }

      if (account?.provider) {
        token.loginType = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.role = token.role as string;
      session.user.loginType = token.loginType as string;

      return session;
    },

    async signIn({ user, account }) {
      try {
        // ✅ Dynamically import database modules inside the callback (Node.js runtime)
        const { dbConnect } = await import("@/lib/mongodb");
        const User = (await import("@/lib/models/User")).default;

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

  pages: {
    signIn: "/login",
    error: "/login",
  },
});