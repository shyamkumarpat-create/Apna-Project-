"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Heart, MessageCircle, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Property {
  id: string; title: string; price: number; type: string; listingType: string;
  status: string; viewCount: number; likeCount: number; commentCount: number;
  city: string; state: string; createdAt: string; images: string[];
}

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/properties?ownerId=${session.user.id}&limit=48&sort=latest`)
      .then((r) => r.json())
      .then((d) => { setProperties(d.properties); setLoading(false); });
  }, [status, session, router]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    toast({ title: "Status updated", description: `Property marked as ${newStatus.replace("_", " ").toLowerCase()}` });
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Property deleted" });
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    SOLD: "bg-gray-100 text-gray-600",
    RENTED: "bg-blue-100 text-blue-700",
    UNDER_NEGOTIATION: "bg-yellow-100 text-yellow-700",
  };

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="animate-pulse space-y-4">{Array.from({length: 3}).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm">{properties.length} properties</p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />Post New</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <p className="text-gray-400 text-lg mb-2">No listings yet</p>
          <p className="text-gray-300 text-sm mb-4">Post your first property and earn 100 points!</p>
          <Link href="/properties/new">
            <Button className="gap-2"><Plus className="h-4 w-4" />Post First Property</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/properties/${p.id}`} className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-1">
                          {p.title}
                        </Link>
                        <p className="text-sm text-gray-500">{p.city}, {p.state} · {formatDate(p.createdAt)}</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(p.price)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/properties/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => deleteProperty(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? ""}`}>
                        {p.status.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.viewCount}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likeCount}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.commentCount}</span>
                      </div>
                      <div className="ml-auto">
                        <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="UNDER_NEGOTIATION">Under Negotiation</SelectItem>
                            <SelectItem value="SOLD">Sold</SelectItem>
                            <SelectItem value="RENTED">Rented</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
