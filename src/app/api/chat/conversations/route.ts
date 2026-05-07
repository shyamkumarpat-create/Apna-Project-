import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId, propertyId } = await req.json();
  if (!recipientId) return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  if (recipientId === session.user.id) return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: recipientId } } },
        ...(propertyId ? [{ propertyId }] : [{ propertyId: null }]),
      ],
    },
  });

  if (existing) return NextResponse.json(existing);

  const conversation = await prisma.conversation.create({
    data: {
      initiatorId: session.user.id,
      propertyId: propertyId ?? null,
      members: {
        create: [{ userId: session.user.id }, { userId: recipientId }],
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });

  await awardPoints(session.user.id, "FIRST_CHAT", "Started your first chat!");

  return NextResponse.json(conversation, { status: 201 });
}
