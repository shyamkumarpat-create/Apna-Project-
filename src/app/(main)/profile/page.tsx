"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getLevel, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string; name: string; email?: string; avatar?: string; bio?: string;
  phone?: string; role: string; createdAt: string;
  gamification: { totalPoints: number; weeklyPoints: number; level: number } | null;
  earnedBadges: { badge: { id: string; name: string; icon: string; tier: string; color: string }; earnedAt: string }[];
  _count: { properties: number; likes: number; comments: number };
}

const TIER_COLORS: Record<string, string> = {
  BRONZE:"text-amber-600",SILVER:"text-gray-400",GOLD:"text-yellow-500",
  PLATINUM:"text-cyan-500",DIAMOND:"text-purple-500",
};

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", phone: "", avatar: "" });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/users/${session.user.id}`)
      .then((r) => r.json())
      .then((u) => {
        setProfile(u);
        setForm({ name: u.name ?? "", bio: u.bio ?? "", phone: u.phone ?? "", avatar: u.avatar ?? "" });
      });
  }, [status, session, router]);

  const save = async () => {
    if (!session) return;
    setSaving(true);
    const res = await fetch(`/api/users/${session.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setProfile((prev) => prev ? { ...prev, ...updated } : null);
      await updateSession({ name: updated.name, avatar: updated.avatar });
      toast({ title: "Profile updated!", description: "Changes saved successfully." });
      setEditing(false);
    }
    setSaving(false);
  };

  if (!profile) return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  const points = profile.gamification?.totalPoints ?? 0;
  const { level, name: levelName, nextLevelPoints, progress } = getLevel(points);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={editing ? form.avatar : profile.avatar ?? ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Avatar URL</Label>
                    <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
                  </div>
                  <div>
                    <Label className="text-xs">Bio</Label>
                    <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[80px] resize-none" placeholder="Tell buyers about yourself..." />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={save} disabled={saving} className="gap-1"><Save className="h-3.5 w-3.5" />{saving ? "Saving..." : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1"><X className="h-3.5 w-3.5" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1 text-gray-500">
                      <Edit2 className="h-3.5 w-3.5" />Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{profile.role}</Badge>
                    <span className="text-xs text-gray-400">Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {profile.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}
                  {profile.phone && <p className="text-sm text-gray-500 mt-1">{profile.phone}</p>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-3xl font-bold text-blue-600">{points.toLocaleString()}</p>
            </div>
            <Badge className="bg-blue-600 text-white text-sm px-3 py-1">Lv.{level} {levelName}</Badge>
          </div>
          <Progress value={progress} className="h-2 mb-1" />
          <p className="text-xs text-gray-400">{nextLevelPoints.toLocaleString()} points to next level</p>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div>
              <p className="font-bold text-gray-800">{profile._count.properties}</p>
              <p className="text-xs text-gray-500">Listings</p>
            </div>
            <div>
              <p className="font-bold text-gray-800">{profile._count.likes}</p>
              <p className="text-xs text-gray-500">Likes Given</p>
            </div>
            <div>
              <p className="font-bold text-gray-800">{profile.earnedBadges.length}</p>
              <p className="text-xs text-gray-500">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Tabs defaultValue="badges">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="badges" className="flex-1">Badges ({profile.earnedBadges.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="badges">
          {profile.earnedBadges.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No badges yet. Keep engaging to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {profile.earnedBadges.map(({ badge, earnedAt }) => (
                <div key={badge.id} className="flex flex-col items-center gap-1.5 p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors" title={`Earned: ${formatDate(earnedAt)}`}>
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-tight">{badge.name}</p>
                  <p className={`text-xs font-bold ${TIER_COLORS[badge.tier] ?? ""}`}>{badge.tier}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
