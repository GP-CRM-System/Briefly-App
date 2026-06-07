import type { UserType } from "./user.type";

// ─── Auth Request/Response types ───
export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    user: UserType;
    token: string;
    message?: string;
};

export type ForgotPasswordRequest = {
    email: string;
};

export type ResetPasswordRequest = {
    token: string;
    password: string;
};

// ─── Generic API Response wrapper ───
export type ApiResponse<T = unknown> = {
    data: T;
    message?: string;
    status: number;
};

export type ApiError = {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
};
