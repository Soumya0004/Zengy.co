import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing email or password");

        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user || !user.password) throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar || null,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email }).lean();
        if (dbUser) token.sub = dbUser._id.toString();
        token.loginType = account?.provider || "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub; // ✅ important
      if (token.loginType) session.user.loginType = token.loginType;
      return session;
    },
    async signIn({ user }) {
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
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
        return true;
      } catch {
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
