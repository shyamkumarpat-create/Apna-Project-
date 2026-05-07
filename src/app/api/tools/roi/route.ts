import { NextRequest, NextResponse } from "next/server";
import { roiInputSchema } from "@/lib/validations";
import { calculateROI } from "@/lib/roi-calculator";
import { auth } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = roiInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const result = calculateROI(parsed.data);

  // Award points for using the tool
  const session = await auth();
  if (session) {
    await awardPoints(session.user.id, "USE_ROI_CALCULATOR", "Used ROI Calculator");
  }

  return NextResponse.json(result);
}
