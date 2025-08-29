let accessTokenMem: string | null = null;
let refreshTokenMem: string | null = null;

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function setTokens(at: string | null, rt: string | null) {
  accessTokenMem = at;
  refreshTokenMem = rt;
  if (typeof window !== "undefined") {
    if (at) localStorage.setItem(ACCESS_KEY, at);
    else localStorage.removeItem(ACCESS_KEY);
    if (rt) localStorage.setItem(REFRESH_KEY, rt);
    else localStorage.removeItem(REFRESH_KEY);
  }
}

export function getAccessToken() {
  if (accessTokenMem) return accessTokenMem;
  if (typeof window !== "undefined")
    accessTokenMem = localStorage.getItem(ACCESS_KEY);
  return accessTokenMem;
}

export function getRefreshToken() {
  if (refreshTokenMem) return refreshTokenMem;
  if (typeof window !== "undefined")
    refreshTokenMem = localStorage.getItem(REFRESH_KEY);
  return refreshTokenMem;
}

export function clearTokens() {
  setTokens(null, null);
}
