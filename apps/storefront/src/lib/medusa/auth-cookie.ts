import "server-only";

import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "_vaivae_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const authCookieOptions = {
  httpOnly: true,
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
  sameSite: "lax",
  secure: process.env["NODE_ENV"] === "production",
} as const;

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value.trim();

  return token || undefined;
}

export async function setAuthToken(token: string): Promise<void> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("Cannot set an empty Medusa auth token cookie.");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, normalizedToken, authCookieOptions);
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}

export async function extendAuthToken(token?: string): Promise<void> {
  const cookieStore = await cookies();
  const normalizedToken = token?.trim() || cookieStore.get(AUTH_COOKIE_NAME)?.value.trim();

  if (!normalizedToken) {
    return;
  }

  cookieStore.set(AUTH_COOKIE_NAME, normalizedToken, authCookieOptions);
}
