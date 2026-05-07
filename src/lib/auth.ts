import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { gamification: true },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordMatch) return null;

        // Update login streak
        const today = new Date().toDateString();
        const lastLogin = user.lastLoginAt?.toDateString();
        let streak = user.loginStreak;

        if (lastLogin !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          streak = lastLogin === yesterday.toDateString() ? streak + 1 : 1;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), loginStreak: streak },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          points: user.gamification?.totalPoints ?? 0,
          level: user.gamification?.level ?? 1,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
        token.avatar = (user as { avatar?: string }).avatar;
        token.points = (user as { points?: number }).points ?? 0;
        token.level = (user as { level?: number }).level ?? 1;
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.avatar = session.avatar ?? token.avatar;
        token.points = session.points ?? token.points;
        token.level = session.level ?? token.level;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string | undefined;
        session.user.points = token.points as number;
        session.user.level = token.level as number;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      points: number;
      level: number;
    };
  }
}
