"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Calculator, FileCheck, MessageCircle, Trophy, Plus, Zap, Star, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLevel, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useWebPush } from "@/hooks/useWebPush";

interface DashboardData {
  gamification: { totalPoints: number; weeklyPoints: number; level: number } | null;
  earnedBadges: { badge: { id: string; name: string; icon: string; tier: string; color: string }; earnedAt: string }[];
  recentPoints: { id: string; points: number; action: string; description: string; createdAt: string }[];
  listingCount: number;
  properties: { id: string; title: string; price: number; viewCount: number; likeCount: number; status: string }[];
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-600", SILVER: "text-gray-400", GOLD: "text-yellow-500",
  PLATINUM: "text-cyan-500", DIAMOND: "text-purple-500",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe } = useWebPush();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/users/${session.user.id}`)
      .then((r) => r.json())
      .then((u) => {
        setData({
          gamification: u.gamification,
          earnedBadges: u.earnedBadges.slice(0, 6),
          recentPoints: [],
          listingCount: u._count.properties,
          properties: [],
        });
      });
  }, [status, session, router]);

  if (!session || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const points = data.gamification?.totalPoints ?? 0;
  const { level, name: levelName, nextLevelPoints, progress } = getLevel(points);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-14 w-14">
          <AvatarImage src={session.user.avatar ?? ""} />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">{session.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session.user.name.split(" ")[0]}!</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white">Level {level} · {levelName}</Badge>
            <span className="text-sm text-gray-500">{points.toLocaleString()} total points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Points & Level Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-200 text-sm">Total Points</p>
                <p className="text-4xl font-bold">{points.toLocaleString()}</p>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-yellow-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Level {level}: {levelName}</span>
                <span className="text-blue-200">{nextLevelPoints.toLocaleString()} to next</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-yellow-400" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{data.listingCount}</p>
                <p className="text-xs text-blue-200">Listings</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{data.earnedBadges.length}</p>
                <p className="text-xs text-blue-200">Badges</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{data.gamification?.weeklyPoints ?? 0}</p>
                <p className="text-xs text-blue-200">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/properties/new">
              <Button variant="outline" className="w-full justify-start gap-2 h-9">
                <Plus className="h-4 w-4 text-blue-600" /> Post Property (+30 pts)
              </Button>
            </Link>
            <Link href="/tools/roi-calculator">
              <Button variant="outline" className="w-full justify-start gap-2 h-9">
                <Calculator className="h-4 w-4 text-green-600" /> ROI Calculator (+5 pts)
              </Button>
            </Link>
            <Link href="/tools/doc-validator">
              <Button variant="outline" className="w-full justify-start gap-2 h-9">
                <FileCheck className="h-4 w-4 text-orange-500" /> Doc Validator (+5 pts)
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="w-full justify-start gap-2 h-9">
                <MessageCircle className="h-4 w-4 text-purple-500" /> Messages
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full justify-start gap-2 h-9">
                <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
              </Button>
            </Link>
            {isSupported && !isSubscribed && (
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-blue-600 border-blue-200" onClick={subscribe} disabled={pushLoading}>
                <Bell className="h-4 w-4" /> {pushLoading ? "Enabling..." : "Enable Notifications"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {data.earnedBadges.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />My Badges</CardTitle>
              <Link href="/profile"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.earnedBadges.map(({ badge }) => (
                <div key={badge.id} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl min-w-[72px] text-center" title={badge.name}>
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-xs font-medium text-gray-700 line-clamp-1">{badge.name}</p>
                  <p className={`text-xs font-bold ${TIER_COLORS[badge.tier] ?? ""}`}>{badge.tier}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Properties Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" />My Listings</CardTitle>
            <Link href="/properties/my-listings"><Button variant="ghost" size="sm" className="text-xs">Manage</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.listingCount === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No listings yet</p>
              <Link href="/properties/new">
                <Button size="sm" className="mt-3 gap-1"><Plus className="h-3 w-3" />Post Property</Button>
              </Link>
            </div>
          ) : (
            <Link href="/properties/my-listings">
              <div className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors cursor-pointer">
                <p className="text-3xl font-bold text-blue-700">{data.listingCount}</p>
                <p className="text-sm text-blue-600">Active Listings</p>
              </div>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
