import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { awardPoints } from "@/lib/gamification";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { propertyId: params.id, parentId: null },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      parentId: parsed.data.parentId ?? null,
      userId: session.user.id,
      propertyId: params.id,
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  const property = await prisma.property.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  if (property) {
    await Promise.all([
      awardPoints(session.user.id, "POST_COMMENT", "Posted a comment"),
      property.ownerId !== session.user.id
        ? awardPoints(property.ownerId, "RECEIVE_COMMENT", "Someone commented on your property!")
        : Promise.resolve(null),
    ]);
  }

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
