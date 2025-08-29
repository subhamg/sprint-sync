import { http } from "./http";
import { setTokens, clearTokens } from "./tokenStore";
import { describe, it, expect, beforeEach } from "vitest";

describe("http auth header", () => {
  beforeEach(() => clearTokens());

  it("attaches Authorization when token exists", async () => {
    setTokens("abc", "def");
    const req = await http.getUri({ url: "/x" });
    // Using getUri to avoid real request; check header via interceptor logic by making a dummy request config
    const cfg: any = { headers: {}, url: "/x" };
    const out = (http.interceptors.request as any).handlers[0].fulfilled(cfg);
    expect(out.headers.Authorization).toBe("Bearer abc");
  });
});
