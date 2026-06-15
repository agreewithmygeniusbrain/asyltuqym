import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import type { SessionUser } from "@/lib/types";

const cookieName = "asyl_session";

function secret() {
  const value = process.env.AUTH_SECRET;

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }

  return "dev-asyl-tuqym-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function seal(session: SessionUser) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function unseal(value?: string): SessionUser | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return unseal(cookieStore.get(cookieName)?.value);
}

export async function setSession(session: SessionUser) {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, seal(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export function requireSeller(session: SessionUser | null) {
  if (!session?.sellerId) {
    throw new Error("SELLER_REQUIRED");
  }

  return session.sellerId;
}

export function requireAdmin(session: SessionUser | null) {
  if (session?.role !== "ADMIN") {
    throw new Error("ADMIN_REQUIRED");
  }

  return session;
}
