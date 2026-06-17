export interface Template {
    id: string;
    name: string;
    subject?: string | null;
    htmlBody?: string | null;
    variables?: string[];
    createdAt?: string;
    updatedAt?: string;
}
