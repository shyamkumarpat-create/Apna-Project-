import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { awardPoints } from "@/lib/gamification";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, avatar: true, phone: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count
  await prisma.property.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  // Award points for milestone views
  const newCount = property.viewCount + 1;
  if (newCount === 10) await awardPoints(property.ownerId, "PROPERTY_VIEWED_10", "Your property got 10 views!");
  if (newCount === 100) await awardPoints(property.ownerId, "PROPERTY_VIEWED_100", "Your property got 100 views!");

  const session = await auth();
  let userLiked = false;
  if (session) {
    const like = await prisma.like.findUnique({
      where: { userId_propertyId: { userId: session.user.id, propertyId: params.id } },
    });
    userLiked = !!like;
  }

  return NextResponse.json({
    ...property,
    images: JSON.parse(property.images as string),
    amenities: JSON.parse(property.amenities as string),
    likeCount: property._count.likes,
    commentCount: property._count.comments,
    userLiked,
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (property.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = propertySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { images, amenities, ...rest } = parsed.data;
  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(images !== undefined && { images: JSON.stringify(images) }),
      ...(amenities !== undefined && { amenities: JSON.stringify(amenities) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (property.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
