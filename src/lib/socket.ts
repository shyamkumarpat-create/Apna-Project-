import type { Server as SocketIOServer, Socket } from "socket.io";

interface ServerToClientEvents {
  "message:new": (message: {
    id: string;
    body: string;
    type: string;
    senderId: string;
    senderName: string;
    conversationId: string;
    createdAt: string;
  }) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
  "message:typing": (data: { conversationId: string; userId: string; userName: string }) => void;
  "message:stop-typing": (data: { conversationId: string; userId: string }) => void;
  "notification:points": (data: { points: number; action: string; totalPoints: number }) => void;
  "notification:badge": (data: { id: string; name: string; icon: string }) => void;
}

interface ClientToServerEvents {
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
  "message:send": (data: { conversationId: string; body: string; type: string; senderId: string; senderName: string }) => void;
  "message:typing": (data: { conversationId: string; userId: string; userName: string }) => void;
  "message:stop-typing": (data: { conversationId: string; userId: string }) => void;
  "user:join": (userId: string) => void;
}

export function initSocketHandlers(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on("connection", (socket: Socket) => {
    socket.on("user:join", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      io.emit("user:online", userId);
    });

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on("message:send", (data) => {
      io.to(`conv:${data.conversationId}`).emit("message:new", {
        id: Date.now().toString(),
        body: data.body,
        type: data.type,
        senderId: data.senderId,
        senderName: data.senderName,
        conversationId: data.conversationId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("message:typing", (data) => {
      socket.to(`conv:${data.conversationId}`).emit("message:typing", data);
    });

    socket.on("message:stop-typing", (data) => {
      socket.to(`conv:${data.conversationId}`).emit("message:stop-typing", data);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user:offline", userId);
      }
    });
  });
}
