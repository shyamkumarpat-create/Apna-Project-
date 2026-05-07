import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.like.findUnique({
    where: { userId_propertyId: { userId: session.user.id, propertyId: params.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { propertyId: params.id } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.like.create({ data: { userId: session.user.id, propertyId: params.id } });

  const property = await prisma.property.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  if (property) {
    await Promise.all([
      awardPoints(session.user.id, "GIVE_LIKE", "Liked a property"),
      awardPoints(property.ownerId, "RECEIVE_LIKE", "Your property received a like!"),
    ]);
  }

  const count = await prisma.like.count({ where: { propertyId: params.id } });
  return NextResponse.json({ liked: true, count });
}
