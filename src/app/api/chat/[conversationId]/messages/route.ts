import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: params.conversationId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const messages = await prisma.message.findMany({
    where: { conversationId: params.conversationId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: { conversationId: params.conversationId, senderId: { not: session.user.id }, isRead: false },
    data: { isRead: true },
  });

  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: params.conversationId, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: params.conversationId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      body: parsed.data.body,
      type: parsed.data.type,
      senderId: session.user.id,
      conversationId: params.conversationId,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { updatedAt: new Date() },
  });

  // Emit via Socket.io if available
  const io = (global as { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } }).io;
  if (io) {
    io.to(`conv:${params.conversationId}`).emit("message:new", {
      ...message,
      createdAt: message.createdAt.toISOString(),
    });
  }

  return NextResponse.json(message, { status: 201 });
}
