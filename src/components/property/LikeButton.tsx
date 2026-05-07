"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface LikeButtonProps {
  propertyId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ propertyId, initialLiked, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);
    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/properties/${propertyId}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
      if (data.liked) toast({ title: "+2 points!", description: "You liked a property", variant: "default" });
    } catch {
      // Revert on error
      setLiked(liked);
      setCount(count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className={cn(
        "gap-2 transition-all",
        liked && "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
      )}
    >
      <Heart className={cn("h-4 w-4 transition-all", liked && "fill-red-500 text-red-500", loading && "animate-pulse")} />
      <span>{count}</span>
    </Button>
  );
}
