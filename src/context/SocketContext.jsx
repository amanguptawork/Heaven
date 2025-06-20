import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  const joinedRef = useRef(false);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
    const sock = io(baseUrl, {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("authToken") },
      autoConnect: false,
    });

    setSocket(sock);
    return () => {
      sock.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // (re)set auth token in case it changed
    socket.auth = { token: localStorage.getItem("authToken") };
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      if (user?.id && !joinedRef.current) {
        socket.emit("join_user_room", { userId: user.id });
        joinedRef.current = true;
      }
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message");
    socket.on("unread_count_updated");
    return () => {
      socket.off("new_message");
      socket.off("unread_count_updated");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) throw new Error("SocketProvider is missing");
  return ctx;
}
