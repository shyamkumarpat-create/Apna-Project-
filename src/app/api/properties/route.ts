import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { awardPoints } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 48);
  const type = searchParams.get("type");
  const listingType = searchParams.get("listingType");
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");
  const sort = searchParams.get("sort") ?? "latest";
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (listingType) where.listingType = listingType;
  if (city) where.city = { contains: city };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
  }
  if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
  if (featured === "true") where.isFeatured = true;

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "popular" ? { viewCount: "desc" as const } :
    { createdAt: "desc" as const };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    properties: properties.map((p) => ({
      ...p,
      images: JSON.parse(p.images as string),
      amenities: JSON.parse(p.amenities as string),
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { images, amenities, ...rest } = parsed.data;

  const firstListing = await prisma.property.count({ where: { ownerId: session.user.id } });

  const property = await prisma.property.create({
    data: {
      ...rest,
      images: JSON.stringify(images),
      amenities: JSON.stringify(amenities),
      ownerId: session.user.id,
    },
  });

  if (firstListing === 0) {
    await awardPoints(session.user.id, "FIRST_LISTING", "First property listing posted!");
  }
  await awardPoints(session.user.id, "POST_LISTING", `Posted: ${property.title}`);

  const io = (global as { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } }).io;
  if (io) {
    io.to("notifications").emit("notification:points", { points: 30, action: "POST_LISTING" });
  }

  return NextResponse.json(property, { status: 201 });
}
