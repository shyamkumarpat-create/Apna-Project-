import { prisma } from "@/lib/prisma";
import { PointAction } from "@/generated/prisma/client";
import { getLevel } from "@/lib/utils";

const POINT_VALUES: Record<PointAction, number> = {
  REGISTER: 50,
  FIRST_LISTING: 100,
  POST_LISTING: 30,
  RECEIVE_LIKE: 5,
  GIVE_LIKE: 2,
  POST_COMMENT: 10,
  RECEIVE_COMMENT: 8,
  LOGIN_STREAK_3: 25,
  LOGIN_STREAK_7: 75,
  LOGIN_STREAK_30: 200,
  PROFILE_COMPLETE: 50,
  FIRST_CHAT: 15,
  USE_ROI_CALCULATOR: 5,
  USE_DOC_VALIDATOR: 5,
  PROPERTY_VIEWED_10: 10,
  PROPERTY_VIEWED_100: 50,
};

const DAILY_LIMITS: Partial<Record<PointAction, number>> = {
  POST_LISTING: 5,
  GIVE_LIKE: 20,
  POST_COMMENT: 10,
  USE_ROI_CALCULATOR: 1,
  USE_DOC_VALIDATOR: 1,
};

const ONE_TIME_ACTIONS: PointAction[] = [
  "REGISTER",
  "FIRST_LISTING",
  "PROFILE_COMPLETE",
  "FIRST_CHAT",
];

async function checkDailyLimit(userId: string, action: PointAction): Promise<boolean> {
  const limit = DAILY_LIMITS[action];
  if (!limit) return true;

  const today = new Date().toISOString().split("T")[0];

  const record = await prisma.dailyLimit.upsert({
    where: { userId_action_date: { userId, action, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, action, date: today, count: 1 },
  });

  return record.count <= limit;
}

async function checkOneTimeAction(userId: string, action: PointAction): Promise<boolean> {
  if (!ONE_TIME_ACTIONS.includes(action)) return true;

  const existing = await prisma.pointEvent.findFirst({
    where: { userId, action },
  });
  return !existing;
}

async function evaluateBadges(userId: string, totalPoints: number, pointEvents: { action: string }[]) {
  const badges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({ where: { userId } });
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  const newBadges = [];

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const condition = JSON.parse(badge.condition);
    let earned = false;

    if (condition.type === "point_threshold") {
      earned = totalPoints >= condition.value;
    } else if (condition.type === "action_count") {
      const count = pointEvents.filter((e) => e.action === condition.action).length;
      earned = count >= condition.value;
    } else if (condition.type === "level_reached") {
      const { level } = getLevel(totalPoints);
      earned = level >= condition.value;
    }

    if (earned) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      newBadges.push(badge);
    }
  }

  return newBadges;
}

export async function awardPoints(
  userId: string,
  action: PointAction,
  description?: string
): Promise<{ points: number; newBadges: { id: string; name: string; icon: string }[]; newLevel?: number } | null> {
  const withinLimit = await checkDailyLimit(userId, action);
  if (!withinLimit) return null;

  const isAllowed = await checkOneTimeAction(userId, action);
  if (!isAllowed) return null;

  const points = POINT_VALUES[action];

  await prisma.pointEvent.create({
    data: {
      userId,
      points,
      action,
      description: description ?? action.replace(/_/g, " ").toLowerCase(),
    },
  });

  const gamification = await prisma.gamification.upsert({
    where: { userId },
    update: {
      totalPoints: { increment: points },
      weeklyPoints: { increment: points },
      monthlyPoints: { increment: points },
    },
    create: {
      userId,
      totalPoints: points,
      weeklyPoints: points,
      monthlyPoints: points,
      level: 1,
    },
  });

  const { level } = getLevel(gamification.totalPoints);
  let newLevel: number | undefined;

  if (level !== gamification.level) {
    await prisma.gamification.update({ where: { userId }, data: { level } });
    newLevel = level;
  }

  const allEvents = await prisma.pointEvent.findMany({ where: { userId }, select: { action: true } });
  const newBadges = await evaluateBadges(userId, gamification.totalPoints, allEvents);

  return {
    points,
    newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon })),
    newLevel,
  };
}
