import { AuthenticatedUser } from "./user";

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthenticatedUser;
  errors?: Record<string, string[]>;
}
