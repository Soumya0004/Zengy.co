import { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  trustHost: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role || "user";
        token.loginType =
          (user as any).loginType || "credentials";
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
      session.user.loginType =
        token.loginType as string;

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;