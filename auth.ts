import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
    };
  }

  interface JWT {
    loginType?: string;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    /* ---------- Google Provider ---------- */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    /* ---------- Credentials Provider ---------- */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = (await User.findOne({
          email: credentials.email,
        }).lean()) as any;

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
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar || null,
          loginType: "credentials",
        };
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },


  callbacks: {
    async jwt({ token, user, account }) {
      await dbConnect();

      if (user?.email) {
        const dbUser = (await User.findOne({
          email: user.email,
        }).lean()) as any;

        if (dbUser) {
          token.sub = dbUser._id.toString();
        }
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

      if (token.loginType && typeof token.loginType === "string") {
        session.user.loginType = token.loginType;
      }

      return session;
    },

    async signIn({ user, account }) {
      try {
        await dbConnect();

        if (account?.provider === "google") {
          const existingUser = await User.findOne({
            email: user.email,
          });

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              avatar:
                user.image ||
                "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
              cart: [],
              favourites: [],
              orders: [],
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
  },

  

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
