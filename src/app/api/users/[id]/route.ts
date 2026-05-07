import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import { awardPoints } from "@/lib/gamification";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      gamification: true,
      earnedBadges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
      _count: { select: { properties: true, likes: true, comments: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, avatar: true, bio: true, phone: true, role: true },
  });

  // Check if profile is now complete (bio + phone + avatar all set)
  if (updated.bio && updated.phone && updated.avatar) {
    await awardPoints(session.user.id, "PROFILE_COMPLETE", "Profile completed!");
  }

  return NextResponse.json(updated);
}
