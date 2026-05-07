"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session) return;

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "", {
        transports: ["websocket", "polling"],
      });
    }

    socketRef.current = socketInstance;

    const onConnect = () => {
      setConnected(true);
      socketInstance?.emit("user:join", session.user.id);
    };

    const onDisconnect = () => setConnected(false);

    if (socketInstance.connected) {
      setConnected(true);
      socketInstance.emit("user:join", session.user.id);
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    return () => {
      socketInstance?.off("connect", onConnect);
      socketInstance?.off("disconnect", onDisconnect);
    };
  }, [session]);

  return { socket: socketRef.current, connected };
}
