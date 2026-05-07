"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { getLevel } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  level: number;
  topBadge?: { name: string; icon: string; color: string; tier: string } | null;
  listingCount: number;
}

const RANK_ICONS = [
  <Crown key={1} className="h-5 w-5 text-yellow-500" />,
  <Medal key={2} className="h-5 w-5 text-gray-400" />,
  <Medal key={3} className="h-5 w-5 text-amber-600" />,
];

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-600",
  SILVER: "text-gray-400",
  GOLD: "text-yellow-500",
  PLATINUM: "text-cyan-500",
  DIAMOND: "text-purple-500",
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gamification/leaderboard?period=${period}&limit=25`)
      .then((r) => r.json())
      .then((d) => { setEntries(d); setLoading(false); });
  }, [period]);

  const userRank = entries.findIndex((e) => e.userId === session?.user.id) + 1;

  const getPoints = (e: LeaderboardEntry) =>
    period === "weekly" ? e.weeklyPoints : period === "monthly" ? e.monthlyPoints : e.totalPoints;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="h-14 w-14 bg-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top property experts on Apna Project</p>
        {session && userRank > 0 && (
          <p className="text-blue-600 font-medium mt-2">Your rank: #{userRank}</p>
        )}
      </div>

      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Time</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[entries[1], entries[0], entries[2]].map((e, i) => {
            const podiumOrder = [2, 1, 3];
            const heights = ["h-24", "h-32", "h-20"];
            const isFirst = podiumOrder[i] === 1;
            return (
              <div key={e.userId} className="flex flex-col items-center gap-2">
                {isFirst && <Star className="h-6 w-6 text-yellow-500 animate-pulse" />}
                <Avatar className={`${isFirst ? "h-16 w-16" : "h-12 w-12"} ring-2 ${isFirst ? "ring-yellow-500" : "ring-gray-200"}`}>
                  <AvatarImage src={e.avatar ?? ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{e.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-gray-700 text-center max-w-[70px] line-clamp-1">{e.name}</p>
                <p className="text-xs text-blue-600 font-bold">{getPoints(e).toLocaleString()} pts</p>
                <div className={`${heights[i]} w-16 rounded-t-lg flex items-center justify-center text-white font-bold text-lg ${
                  podiumOrder[i] === 1 ? "bg-yellow-500" : podiumOrder[i] === 2 ? "bg-gray-400" : "bg-amber-600"
                }`}>
                  {podiumOrder[i]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const { name: levelName } = getLevel(e.totalPoints);
            const isCurrentUser = e.userId === session?.user.id;
            return (
              <Card key={e.userId} className={`transition-all ${isCurrentUser ? "border-blue-300 bg-blue-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {e.rank <= 3 ? RANK_ICONS[e.rank - 1] : (
                        <span className={`text-sm font-bold ${isCurrentUser ? "text-blue-600" : "text-gray-400"}`}>#{e.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={e.avatar ?? ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">{e.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${isCurrentUser ? "text-blue-700" : "text-gray-800"}`}>
                          {e.name} {isCurrentUser && "(You)"}
                        </p>
                        {e.topBadge && (
                          <span className={`text-xs ${TIER_COLORS[e.topBadge.tier]}`} title={e.topBadge.name}>
                            {e.topBadge.icon}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Level {e.level} · {levelName} · {e.listingCount} listings</p>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-blue-600">{getPoints(e).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
