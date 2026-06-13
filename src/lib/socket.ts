import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const getSocketUrl = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:6892/api";
    // Vercel Serverless Functions do not support persistent WebSockets/Socket.io.
    // If we are on localhost but VITE_API_BASE_URL points to Vercel, connect sockets to local server instead:
    if (window.location.hostname === "localhost" && apiBaseUrl.includes("vercel.app")) {
        console.info("[Socket] Serverless target detected. Rerouting WebSockets connection to local development server: http://localhost:6892");
        return "http://localhost:6892";
    }
    return apiBaseUrl.replace(/\/api\/?$/, "");
};

export const socket: Socket = io(getSocketUrl(), {
    autoConnect: false,
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
