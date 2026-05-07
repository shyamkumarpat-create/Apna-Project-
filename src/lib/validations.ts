import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const propertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(30, "Description must be at least 30 characters"),
  price: z.number().positive("Price must be positive"),
  priceUnit: z.enum(["TOTAL", "PER_SQFT", "PER_MONTH"]).default("TOTAL"),
  type: z.enum(["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "OFFICE", "SHOP", "WAREHOUSE", "FARMHOUSE", "PG"]),
  listingType: z.enum(["SALE", "RENT"]),
  area: z.number().positive("Area must be positive"),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floors: z.number().int().min(0).optional(),
  parkingSpots: z.number().int().min(0).optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  address: z.string().min(5, "Address is required"),
  pincode: z.string().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED", "UNDER_NEGOTIATION"]).default("AVAILABLE"),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
  parentId: z.string().optional(),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(1000),
  type: z.enum(["TEXT", "IMAGE", "PROPERTY_SHARE"]).default("TEXT"),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(200).optional(),
  phone: z.string().regex(/^\+?[0-9]{10,13}$/, "Invalid phone number").optional().or(z.literal("")),
  avatar: z.string().optional(),
});

export const roiInputSchema = z.object({
  purchasePrice: z.number().positive(),
  stampDutyPercent: z.number().min(0).max(20).default(5),
  registrationFeePercent: z.number().min(0).max(10).default(1),
  brokeragePercent: z.number().min(0).max(5).default(1),
  renovationCost: z.number().min(0).default(0),
  monthlyRent: z.number().min(0).default(0),
  vacancyRatePercent: z.number().min(0).max(100).default(5),
  maintenanceCostPercent: z.number().min(0).max(100).default(10),
  isFinanced: z.boolean().default(false),
  loanAmount: z.number().min(0).default(0),
  interestRatePercent: z.number().min(0).max(30).default(8.5),
  loanTenureYears: z.number().min(1).max(30).default(20),
  expectedAppreciationPercent: z.number().min(0).max(50).default(8),
  holdingPeriodYears: z.number().min(1).max(50).default(5),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ROIInput = z.infer<typeof roiInputSchema>;
