"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectedUsers: Array<{ userId: string; name: string }>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectedUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<Array<{ userId: string; name: string }>>([]);

  useEffect(() => {
    if (!session) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      newSocket.emit("user:join", {
        userId: (session as any)?.userId,
        name: (session as any)?.user?.name || "User",
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("users:update", (users) => {
      setConnectedUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectedUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
