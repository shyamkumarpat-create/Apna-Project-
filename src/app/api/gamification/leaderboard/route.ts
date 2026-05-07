import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  const orderBy =
    period === "weekly" ? { weeklyPoints: "desc" as const } :
    period === "monthly" ? { monthlyPoints: "desc" as const } :
    { totalPoints: "desc" as const };

  const leaderboard = await prisma.gamification.findMany({
    orderBy,
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, avatar: true, role: true },
        include: {
          earnedBadges: { include: { badge: true }, orderBy: { earnedAt: "desc" }, take: 1 },
          _count: { select: { properties: true } },
        },
      },
    },
  });

  return NextResponse.json(
    leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.user.id,
      name: entry.user.name,
      avatar: entry.user.avatar,
      role: entry.user.role,
      totalPoints: entry.totalPoints,
      weeklyPoints: entry.weeklyPoints,
      monthlyPoints: entry.monthlyPoints,
      level: entry.level,
      topBadge: entry.user.earnedBadges[0]?.badge ?? null,
      listingCount: entry.user._count.properties,
    }))
  );
}
