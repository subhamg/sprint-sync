import { http } from "../lib/http";

export interface MeResponse {
  userId: string;
  isAdmin: boolean;
}

export class AuthService {
  async login(email: string, password: string): Promise<void> {
    await http.post("/auth/login", { email, password });
  }

  async logout(): Promise<void> {
    await http.post("/auth/logout");
  }

  async me(): Promise<MeResponse> {
    const { data } = await http.get<MeResponse>("/auth/me");
    return data;
  }
}

export const authService = new AuthService();
