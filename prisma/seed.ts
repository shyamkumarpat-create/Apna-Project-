import "dotenv/config";
import { PrismaClient, BadgeTier, PropertyType, ListingType, UserRole, PointAction } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const BADGES: Array<{
  name: string; slug: string; description: string; icon: string; color: string;
  tier: BadgeTier; requiredPoints?: number; condition: string;
}> = [
  { name: "First Step", slug: "first-step", description: "Post your first property listing", icon: "🏠", color: "text-amber-600", tier: BadgeTier.BRONZE, condition: JSON.stringify({ type: "action_count", action: "FIRST_LISTING", value: 1 }) },
  { name: "Social Butterfly", slug: "social-butterfly", description: "Post 5 comments in total", icon: "🦋", color: "text-amber-600", tier: BadgeTier.BRONZE, condition: JSON.stringify({ type: "action_count", action: "POST_COMMENT", value: 5 }) },
  { name: "Explorer", slug: "explorer", description: "Earn your first 50 points", icon: "🧭", color: "text-amber-600", tier: BadgeTier.BRONZE, condition: JSON.stringify({ type: "point_threshold", value: 50 }) },
  { name: "Curious", slug: "curious", description: "Use the ROI Calculator", icon: "🔍", color: "text-amber-600", tier: BadgeTier.BRONZE, condition: JSON.stringify({ type: "action_count", action: "USE_ROI_CALCULATOR", value: 1 }) },
  { name: "Crowd Pleaser", slug: "crowd-pleaser", description: "Receive 5 likes on your listings", icon: "❤️", color: "text-gray-400", tier: BadgeTier.SILVER, condition: JSON.stringify({ type: "action_count", action: "RECEIVE_LIKE", value: 5 }) },
  { name: "Conversationalist", slug: "conversationalist", description: "Start your first chat", icon: "💬", color: "text-gray-400", tier: BadgeTier.SILVER, condition: JSON.stringify({ type: "action_count", action: "FIRST_CHAT", value: 1 }) },
  { name: "Prolific Poster", slug: "prolific-poster", description: "Post 3 property listings", icon: "📋", color: "text-gray-400", tier: BadgeTier.SILVER, condition: JSON.stringify({ type: "action_count", action: "POST_LISTING", value: 3 }) },
  { name: "Commentator", slug: "commentator", description: "Post 10 comments total", icon: "✍️", color: "text-gray-400", tier: BadgeTier.SILVER, condition: JSON.stringify({ type: "action_count", action: "POST_COMMENT", value: 10 }) },
  { name: "Hot Property", slug: "hot-property", description: "One listing gets 10 likes", icon: "🔥", color: "text-yellow-500", tier: BadgeTier.GOLD, condition: JSON.stringify({ type: "action_count", action: "RECEIVE_LIKE", value: 10 }) },
  { name: "Top Agent", slug: "top-agent", description: "Post 5 property listings", icon: "⭐", color: "text-yellow-500", tier: BadgeTier.GOLD, condition: JSON.stringify({ type: "action_count", action: "POST_LISTING", value: 5 }) },
  { name: "Streak Master", slug: "streak-master", description: "Login 7 days in a row", icon: "🌟", color: "text-yellow-500", tier: BadgeTier.GOLD, condition: JSON.stringify({ type: "action_count", action: "LOGIN_STREAK_7", value: 1 }) },
  { name: "Well Connected", slug: "well-connected", description: "Complete your profile", icon: "🤝", color: "text-yellow-500", tier: BadgeTier.GOLD, condition: JSON.stringify({ type: "action_count", action: "PROFILE_COMPLETE", value: 1 }) },
  { name: "Century Club", slug: "century-club", description: "Earn 1000 total points", icon: "💯", color: "text-cyan-500", tier: BadgeTier.PLATINUM, requiredPoints: 1000, condition: JSON.stringify({ type: "point_threshold", value: 1000 }) },
  { name: "Market Maker", slug: "market-maker", description: "Post 10 property listings", icon: "🏦", color: "text-cyan-500", tier: BadgeTier.PLATINUM, condition: JSON.stringify({ type: "action_count", action: "POST_LISTING", value: 10 }) },
  { name: "Super Star", slug: "super-star", description: "Receive 25 likes across all listings", icon: "🌠", color: "text-cyan-500", tier: BadgeTier.PLATINUM, condition: JSON.stringify({ type: "action_count", action: "RECEIVE_LIKE", value: 25 }) },
  { name: "Doc Expert", slug: "doc-expert", description: "Use Document Validator 5 times", icon: "📄", color: "text-cyan-500", tier: BadgeTier.PLATINUM, condition: JSON.stringify({ type: "action_count", action: "USE_DOC_VALIDATOR", value: 5 }) },
  { name: "Property King", slug: "property-king", description: "Reach Level 10", icon: "👑", color: "text-purple-500", tier: BadgeTier.DIAMOND, condition: JSON.stringify({ type: "level_reached", value: 10 }) },
  { name: "Influencer", slug: "influencer", description: "Earn 5000 total points", icon: "💎", color: "text-purple-500", tier: BadgeTier.DIAMOND, requiredPoints: 5000, condition: JSON.stringify({ type: "point_threshold", value: 5000 }) },
  { name: "Legend", slug: "legend", description: "Earn 2500 total points", icon: "⚡", color: "text-purple-500", tier: BadgeTier.DIAMOND, requiredPoints: 2500, condition: JSON.stringify({ type: "point_threshold", value: 2500 }) },
  { name: "Pioneer", slug: "pioneer", description: "Be among the first 100 users", icon: "🚀", color: "text-purple-500", tier: BadgeTier.DIAMOND, condition: JSON.stringify({ type: "point_threshold", value: 100 }) },
];

const SAMPLE_PROPERTIES: Array<{
  title: string; description: string; price: number; type: PropertyType; listingType: ListingType;
  area: number; bedrooms?: number; bathrooms?: number; floors?: number; parkingSpots?: number;
  city: string; state: string; address: string; pincode: string; images: string; amenities: string; isFeatured: boolean;
}> = [
  {
    title: "Spacious 3 BHK Apartment in Koramangala",
    description: "Beautiful fully furnished apartment in the heart of Koramangala. Walking distance to major tech companies, restaurants, and entertainment. The apartment features modern interiors, modular kitchen, and a stunning view of the city skyline.",
    price: 8500000, type: PropertyType.APARTMENT, listingType: ListingType.SALE, area: 1450, bedrooms: 3, bathrooms: 2,
    city: "Bangalore", state: "Karnataka", address: "5th Block, Koramangala", pincode: "560095",
    images: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]),
    amenities: JSON.stringify(["Lift", "Parking", "Security", "Gym", "CCTV"]), isFeatured: true,
  },
  {
    title: "Modern 2 BHK Flat Near Powai Lake",
    description: "Premium 2 BHK apartment in Powai with lake-facing balcony. Society amenities include swimming pool, gym, and 24/7 security. Just 10 mins from Hiranandani business district.",
    price: 22000, type: PropertyType.APARTMENT, listingType: ListingType.RENT, area: 980, bedrooms: 2, bathrooms: 2,
    city: "Mumbai", state: "Maharashtra", address: "Powai, Near Hiranandani", pincode: "400076",
    images: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]),
    amenities: JSON.stringify(["Swimming Pool", "Gym", "Parking", "Lift", "Security"]), isFeatured: true,
  },
  {
    title: "4 BHK Independent Villa in Whitefield",
    description: "Luxurious independent villa with private garden and swimming pool. Premium finishing throughout with marble flooring, modular kitchen, and designer bathrooms.",
    price: 25000000, type: PropertyType.VILLA, listingType: ListingType.SALE, area: 3200, bedrooms: 4, bathrooms: 4, floors: 2, parkingSpots: 2,
    city: "Bangalore", state: "Karnataka", address: "Whitefield Main Road", pincode: "560066",
    images: JSON.stringify(["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"]),
    amenities: JSON.stringify(["Swimming Pool", "Garden", "Parking", "Security", "Power Backup"]), isFeatured: false,
  },
  {
    title: "Commercial Shop in Connaught Place",
    description: "Prime commercial space in Connaught Place, New Delhi. Ground floor corner shop with excellent footfall. Suitable for retail, showroom, or bank branch.",
    price: 15000000, type: PropertyType.SHOP, listingType: ListingType.SALE, area: 450,
    city: "New Delhi", state: "Delhi", address: "Block A, Connaught Place", pincode: "110001",
    images: JSON.stringify([]), amenities: JSON.stringify(["Power Backup", "Security", "Visitor Parking"]), isFeatured: false,
  },
  {
    title: "1200 sqft Plot in Sarjapur Road",
    description: "Prime residential plot on Sarjapur Road with BBMP approved layout. North-facing plot with good ventilation. Surrounded by ready-to-move-in villas.",
    price: 4800000, type: PropertyType.PLOT, listingType: ListingType.SALE, area: 1200,
    city: "Bangalore", state: "Karnataka", address: "Sarjapur Road, Attibele", pincode: "562107",
    images: JSON.stringify([]), amenities: JSON.stringify([]), isFeatured: false,
  },
  {
    title: "Cozy PG in Indiranagar",
    description: "Fully furnished PG accommodation near 100 Feet Road. AC rooms with attached/common bathrooms available. Meals included. Wi-Fi, laundry facilities available.",
    price: 12000, type: PropertyType.PG, listingType: ListingType.RENT, area: 120,
    city: "Bangalore", state: "Karnataka", address: "12th Main, Indiranagar", pincode: "560038",
    images: JSON.stringify([]), amenities: JSON.stringify(["WiFi Ready", "Water Supply 24/7", "CCTV", "Security"]), isFeatured: false,
  },
  {
    title: "Office Space in Bandra Kurla Complex",
    description: "Premium Grade A office space in BKC. Open plan layout with glass-fronted cabins. Access to shared conference rooms, cafeteria, and parking.",
    price: 180000, type: PropertyType.OFFICE, listingType: ListingType.RENT, area: 2500, floors: 1, parkingSpots: 5,
    city: "Mumbai", state: "Maharashtra", address: "Bandra Kurla Complex", pincode: "400051",
    images: JSON.stringify([]), amenities: JSON.stringify(["Lift", "Parking", "Security", "Power Backup", "CCTV", "WiFi Ready"]), isFeatured: true,
  },
  {
    title: "Farmhouse with 2 Acres Land in Manesar",
    description: "Beautiful farmhouse property with 2 acres of land near Manesar, Gurugram. Ideal for weekend getaway, organic farming, or corporate retreat center.",
    price: 35000000, type: PropertyType.FARMHOUSE, listingType: ListingType.SALE, area: 87120, bedrooms: 3, bathrooms: 3,
    city: "Gurugram", state: "Haryana", address: "Manesar Village Road", pincode: "122051",
    images: JSON.stringify([]), amenities: JSON.stringify(["Garden", "Parking", "Water Supply 24/7"]), isFeatured: false,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed Badges
  console.log("📛 Seeding badges...");
  for (const badge of BADGES) {
    await prisma.badge.upsert({ where: { slug: badge.slug }, update: badge, create: badge });
  }
  console.log(`✅ ${BADGES.length} badges seeded`);

  // Seed Users
  console.log("👤 Seeding users...");
  const password = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "rahul@example.com" }, update: {}, create: { name: "Rahul Sharma", email: "rahul@example.com", password, role: UserRole.SELLER, bio: "Property investor with 10+ years experience", phone: "+919876543210" } }),
    prisma.user.upsert({ where: { email: "priya@example.com" }, update: {}, create: { name: "Priya Patel", email: "priya@example.com", password, role: UserRole.BUYER, bio: "Looking for dream home in Bangalore" } }),
    prisma.user.upsert({ where: { email: "amit@example.com" }, update: {}, create: { name: "Amit Kumar", email: "amit@example.com", password, role: UserRole.SELLER, phone: "+919765432101" } }),
    prisma.user.upsert({ where: { email: "sneha@example.com" }, update: {}, create: { name: "Sneha Reddy", email: "sneha@example.com", password, role: UserRole.BUYER } }),
    prisma.user.upsert({ where: { email: "admin@example.com" }, update: {}, create: { name: "Admin User", email: "admin@example.com", password, role: UserRole.ADMIN } }),
  ]);
  console.log(`✅ ${users.length} users seeded`);

  // Seed Gamification
  console.log("🎮 Seeding gamification...");
  const pointValues = [350, 120, 280, 80, 500];
  for (let i = 0; i < users.length; i++) {
    const pts = pointValues[i];
    await prisma.gamification.upsert({
      where: { userId: users[i].id }, update: {},
      create: { userId: users[i].id, totalPoints: pts, weeklyPoints: Math.floor(pts * 0.3), monthlyPoints: Math.floor(pts * 0.7), level: pts >= 300 ? 4 : pts >= 100 ? 2 : 1 },
    });
  }

  // Seed Properties
  console.log("🏠 Seeding properties...");
  const ownerIds = [users[0].id, users[2].id, users[0].id, users[2].id, users[0].id, users[2].id, users[0].id, users[2].id];
  for (let i = 0; i < SAMPLE_PROPERTIES.length; i++) {
    const prop = SAMPLE_PROPERTIES[i];
    const existing = await prisma.property.findFirst({ where: { title: prop.title } });
    if (!existing) {
      await prisma.property.create({ data: { ...prop, ownerId: ownerIds[i], viewCount: Math.floor(Math.random() * 150) + 10 } });
    }
  }
  const allProps = await prisma.property.findMany({ take: 8 });
  console.log(`✅ ${allProps.length} properties seeded`);

  // Seed Likes
  console.log("❤️ Seeding likes...");
  for (const prop of allProps.slice(0, 4)) {
    for (const user of [users[1], users[3]]) {
      await prisma.like.upsert({
        where: { userId_propertyId: { userId: user.id, propertyId: prop.id } },
        update: {}, create: { userId: user.id, propertyId: prop.id },
      });
    }
  }

  // Seed Comments
  console.log("💬 Seeding comments...");
  if (allProps.length > 0) {
    const prop = allProps[0];
    const existing = await prisma.comment.findFirst({ where: { propertyId: prop.id } });
    if (!existing) {
      const c1 = await prisma.comment.create({ data: { body: "Great property! Is the price negotiable?", userId: users[1].id, propertyId: prop.id } });
      await prisma.comment.create({ data: { body: "Yes, we can discuss. Please reach out via chat.", userId: users[0].id, propertyId: prop.id, parentId: c1.id } });
      await prisma.comment.create({ data: { body: "What is the maintenance charge?", userId: users[3].id, propertyId: prop.id } });
    }
  }

  // Seed Point Events
  console.log("⚡ Seeding point events...");
  const actions: PointAction[] = [PointAction.REGISTER, PointAction.POST_LISTING, PointAction.RECEIVE_LIKE, PointAction.POST_COMMENT];
  for (const user of users) {
    const existing = await prisma.pointEvent.findFirst({ where: { userId: user.id } });
    if (!existing) {
      for (const action of actions) {
        await prisma.pointEvent.create({ data: { userId: user.id, points: 30, action, description: action.toLowerCase().replace(/_/g, " ") } });
      }
    }
  }

  // Seed a Conversation
  console.log("📨 Seeding conversations...");
  const existingConv = await prisma.conversation.findFirst({ where: { initiatorId: users[1].id } });
  if (!existingConv && allProps.length > 0) {
    const conv = await prisma.conversation.create({
      data: {
        initiatorId: users[1].id,
        propertyId: allProps[0].id,
        members: { create: [{ userId: users[1].id }, { userId: users[0].id }] },
      },
    });
    await prisma.message.create({ data: { body: "Hi! I'm interested in your Koramangala apartment. Can we schedule a visit?", senderId: users[1].id, conversationId: conv.id } });
    await prisma.message.create({ data: { body: "Of course! How about this weekend? Saturday morning works best for me.", senderId: users[0].id, conversationId: conv.id } });
  }

  console.log("🎉 Seed complete! Login with: rahul@example.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
