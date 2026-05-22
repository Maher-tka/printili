import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getConfiguredAdminPassword, isProductionRuntime } from "@/lib/runtime-config";

const adminCookieName = "photo_montage_admin";
const adminSessionDurationSeconds = 60 * 60 * 12;

export async function isAdminAuthenticated() {
  const password = getConfiguredAdminPassword();

  if (!password) {
    return true;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;

  return Boolean(token && isValidAdminSessionToken(token, password));
}

export function getAdminCookieName() {
  return adminCookieName;
}

export function getAdminCookieOptions(env: { NODE_ENV?: string } = process.env) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProductionRuntime(env),
    path: "/",
    maxAge: adminSessionDurationSeconds
  };
}

export function matchesAdminPassword(candidate: string, expectedPassword: string) {
  return timingSafeStringEqual(hashValue(candidate), hashValue(expectedPassword));
}

export function createAdminSessionToken(password: string, now = Date.now()) {
  const expiresAt = now + adminSessionDurationSeconds * 1000;
  const payload = String(expiresAt);

  return `${payload}.${signAdminSessionPayload(payload, password)}`;
}

export function isValidAdminSessionToken(token: string, password: string, now = Date.now()) {
  const [payload, signature, ...rest] = token.split(".");
  const expiresAt = Number(payload);

  if (rest.length > 0 || !payload || !signature || !Number.isFinite(expiresAt) || expiresAt <= now) {
    return false;
  }

  return timingSafeStringEqual(signature, signAdminSessionPayload(payload, password));
}

function signAdminSessionPayload(payload: string, password: string) {
  return createHmac("sha256", password).update(`admin:${payload}`).digest("base64url");
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
