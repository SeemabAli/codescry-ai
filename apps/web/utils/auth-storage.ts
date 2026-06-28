import type { AuthUser } from "@/types/auth";

const AUTH_TOKEN_KEY = "codescry_token";
const AUTH_USER_KEY = "codescry_user";

export function saveAuthSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(AUTH_USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}