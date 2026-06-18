import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const getSocketUrl = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:6892/api";
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    // Vercel Serverless Functions do not support persistent WebSockets/Socket.io.
    // Reroute to local development server when running locally if API points to Vercel or is relative.
    if (isLocal) {
        if (apiBaseUrl.includes("vercel.app") || apiBaseUrl.startsWith("/") || apiBaseUrl === "/api") {
            console.info("[Socket] Development mode. Rerouting WebSockets connection to local server: http://localhost:6892");
            return "http://localhost:6892";
        }
    }
    return apiBaseUrl.replace(/\/api\/?$/, "");
};

export const socket: Socket = io(getSocketUrl(), {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: (cb) => {
        const token = useAuthStore.getState().token;
        cb({
            token: token ? `Bearer ${token}` : undefined
        });
    }
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
