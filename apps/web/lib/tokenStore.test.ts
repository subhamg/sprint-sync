import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "./tokenStore";
import { describe, it, expect, beforeEach } from "vitest";

describe("tokenStore", () => {
  beforeEach(() => {
    // jsdom localStorage starts clean per test env
    clearTokens();
  });

  it("sets and gets tokens from memory and localStorage", () => {
    setTokens("at", "rt");
    expect(getAccessToken()).toBe("at");
    expect(getRefreshToken()).toBe("rt");

    // clear and rehydrate from localStorage
    (global as any).accessTokenMem = null;
    (global as any).refreshTokenMem = null;
    expect(getAccessToken()).toBe("at");
    expect(getRefreshToken()).toBe("rt");
  });

  it("clears tokens", () => {
    setTokens("at", "rt");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
