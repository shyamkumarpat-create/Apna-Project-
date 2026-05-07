"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/hooks/useSocket";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  body: string;
  type: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string | null };
}

interface ConvMember {
  user: { id: string; name: string; avatar?: string | null };
}

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ConvMember[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/chat/${conversationId}/messages`)
      .then((r) => r.json())
      .then(setMessages);

    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((convs: { id: string; members: ConvMember[] }[]) => {
        const conv = convs.find((c) => c.id === conversationId);
        if (conv) setMembers(conv.members);
      });
  }, [conversationId, status, router]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("conversation:join", conversationId);

    const onMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setOtherTyping(false);
    };

    const onTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== session?.user.id) {
        setOtherTyping(true);
      }
    };

    const onStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== session?.user.id) {
        setOtherTyping(false);
      }
    };

    socket.on("message:new", onMessage);
    socket.on("message:typing", onTyping);
    socket.on("message:stop-typing", onStopTyping);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onMessage);
      socket.off("message:typing", onTyping);
      socket.off("message:stop-typing", onStopTyping);
    };
  }, [socket, conversationId, session]);

  const sendMessage = async () => {
    if (!input.trim() || !session) return;
    setSending(true);
    const body = input.trim();
    setInput("");

    if (socket && connected) {
      socket.emit("message:send", {
        conversationId,
        body,
        type: "TEXT",
        senderId: session.user.id,
        senderName: session.user.name,
      });
    }

    // Also persist via REST
    const res = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, type: "TEXT" }),
    });
    const msg = await res.json();
    setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    setSending(false);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!socket || !session) return;
    socket.emit("message:typing", { conversationId, userId: session.user.id, userName: session.user.name });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("message:stop-typing", { conversationId, userId: session.user.id });
    }, 2000);
  };

  const otherUser = members.find((m) => m.user.id !== session?.user.id)?.user;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {otherUser && (
          <>
            <Avatar className="h-9 w-9">
              <AvatarImage src={otherUser.avatar ?? ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-800">{otherUser.name}</p>
              <div className="flex items-center gap-1">
                <Circle className={`h-2 w-2 ${connected ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"}`} />
                <span className="text-xs text-gray-400">{connected ? "Online" : "Offline"}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  isOwn
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.body}
                </div>
                <span className="text-xs text-gray-400 mt-1">{formatRelativeTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
