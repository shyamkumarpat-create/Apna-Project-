"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface ConversationMember {
  user: { id: string; name: string; avatar?: string | null };
}

interface Conversation {
  id: string;
  updatedAt: string;
  members: ConversationMember[];
  messages: { body: string; senderId: string; createdAt: string }[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((d) => { setConversations(d); setLoading(false); });
  }, [status, router]);

  const getOtherUser = (conv: Conversation) =>
    conv.members.find((m) => m.user.id !== session?.user.id)?.user;

  if (loading) return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="animate-pulse space-y-3">{Array.from({length: 4}).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        Messages
      </h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No conversations yet</p>
          <p className="text-gray-300 text-sm mt-1">Start chatting by clicking "Chat with Owner" on any property</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const other = getOtherUser(conv);
            const lastMsg = conv.messages[0];
            if (!other) return null;

            return (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={other.avatar ?? ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{other.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-sm">{other.name}</p>
                      <span className="text-xs text-gray-400">{formatRelativeTime(conv.updatedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {lastMsg ? (lastMsg.senderId === session?.user.id ? "You: " : "") + lastMsg.body : "No messages yet"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
