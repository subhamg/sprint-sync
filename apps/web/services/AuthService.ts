import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "lib/tokenStore";
import { http } from "../lib/http";

export type AuthUser = { id: string; email: string; roles: string[] };
export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export interface MeResponse {
  userId: string;
  isAdmin: boolean;
  name: string;
}

export class AuthService {
  async register(email: string, name: string, password: string): Promise<void> {
    await http.post("/auth/register", { email, name, password });
  }

  async login(email: string, password: string): Promise<void> {
    const { data } = await http.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    setTokens(data.accessToken, data.refreshToken);
  }

  async logout(): Promise<void> {
    clearTokens();
  }

  async me(): Promise<MeResponse> {
    const { data } = await http.get<MeResponse>("/auth/me");
    return data;
  }

  getToken(): string | null {
    return getAccessToken() ?? null;
  }

  getRefreshToken(): string | null {
    return getRefreshToken() ?? null;
  }
}

export const authService = new AuthService();
