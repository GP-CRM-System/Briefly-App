import { create } from "zustand";

interface PresenceState {
    onlineUsers: string[];
    typingUsers: Record<string, string[]>; // conversationId -> array of userIds
    setOnlineUsers: (users: string[]) => void;
    addOnlineUser: (userId: string) => void;
    removeOnlineUser: (userId: string) => void;
    setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
    clearTyping: (conversationId: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
    onlineUsers: [],
    typingUsers: {},
    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.includes(userId)
            ? state.onlineUsers
            : [...state.onlineUsers, userId]
    })),
    removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId)
    })),
    setTyping: (conversationId, userId, isTyping) => set((state) => {
        const current = state.typingUsers[conversationId] || [];
        const updated = isTyping
            ? (current.includes(userId) ? current : [...current, userId])
            : current.filter((id) => id !== userId);
        return {
            typingUsers: {
                ...state.typingUsers,
                [conversationId]: updated
            }
        };
    }),
    clearTyping: (conversationId) => set((state) => {
        const updated = { ...state.typingUsers };
        delete updated[conversationId];
        return { typingUsers: updated };
    })
}));
