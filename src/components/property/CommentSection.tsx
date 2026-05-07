"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
  replies?: Comment[];
}

interface CommentSectionProps {
  propertyId: string;
}

export function CommentSection({ propertyId }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [propertyId]);

  const submit = async () => {
    if (!body.trim()) return;
    if (!session) { router.push("/login"); return; }
    setLoading(true);

    const res = await fetch(`/api/properties/${propertyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim(), parentId: replyTo?.id }),
    });
    const comment = await res.json();

    if (replyTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id ? { ...c, replies: [...(c.replies ?? []), comment] } : c
        )
      );
    } else {
      setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
    }
    setBody("");
    setReplyTo(null);
    setLoading(false);
  };

  const deleteComment = async (commentId: string, parentId?: string) => {
    await fetch(`/api/properties/${propertyId}/comments?commentId=${commentId}`, { method: "DELETE" });
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) } : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-2" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar ?? ""} />
        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{comment.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800">{comment.user.name}</span>
            <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
        </div>
        <div className="flex gap-2 mt-1">
          {!isReply && session && (
            <button
              className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1"
              onClick={() => setReplyTo({ id: comment.id, name: comment.user.name })}
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
          )}
          {session?.user.id === comment.user.id && (
            <button
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              onClick={() => deleteComment(comment.id, isReply ? undefined : undefined)}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
        {!isReply && comment.replies?.map((r) => (
          <CommentItem key={r.id} comment={r} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      <div className="space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
            <Reply className="h-4 w-4" />
            Replying to <strong>{replyTo.name}</strong>
            <button className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder={session ? "Write a comment..." : "Sign in to comment"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!session}
            className="resize-none min-h-[80px]"
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submit(); }}
          />
          <Button onClick={submit} disabled={loading || !body.trim() || !session} size="icon" className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400">Ctrl+Enter to submit • +10 points per comment</p>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
