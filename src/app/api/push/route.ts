import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendPushNotification } from "@/lib/web-push";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = await req.json();
  if (!subscription) return NextResponse.json({ error: "subscription required" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: JSON.stringify(subscription) },
  });

  await sendPushNotification(JSON.stringify(subscription), {
    title: "Apna Project",
    body: "Push notifications enabled! You'll get updates on likes, comments and messages.",
    icon: "/icons/icon-192.png",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: null },
  });

  return NextResponse.json({ success: true });
}
