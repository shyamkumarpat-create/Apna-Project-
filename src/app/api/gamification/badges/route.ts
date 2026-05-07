import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const [badges, userBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: [{ tier: "asc" }, { name: "asc" }] }),
    session
      ? prisma.userBadge.findMany({ where: { userId: session.user.id }, select: { badgeId: true, earnedAt: true } })
      : [],
  ]);

  const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.earnedAt]));

  return NextResponse.json(
    badges.map((b) => ({
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }))
  );
}
