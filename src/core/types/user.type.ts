import type { BaseType, IdType } from "./core.type";

export type UserType = BaseType & IdType & {
    email: string;
    name: string;
    permissions: Record<string, string[]>;
};