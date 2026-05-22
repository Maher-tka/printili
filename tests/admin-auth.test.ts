import { describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  getAdminCookieOptions,
  isValidAdminSessionToken,
  matchesAdminPassword
} from "../lib/admin-auth";

describe("admin auth", () => {
  it("uses signed expiring session tokens instead of storing the raw password", () => {
    const password = "strong-admin-password";
    const now = new Date("2026-05-22T10:00:00Z").getTime();
    const token = createAdminSessionToken(password, now);

    expect(token).not.toContain(password);
    expect(isValidAdminSessionToken(token, password, now + 1000)).toBe(true);
    expect(isValidAdminSessionToken(token, "wrong-password", now + 1000)).toBe(false);
    expect(isValidAdminSessionToken(token, password, now + 13 * 60 * 60 * 1000)).toBe(false);
  });

  it("compares passwords through hashes", () => {
    expect(matchesAdminPassword("secret", "secret")).toBe(true);
    expect(matchesAdminPassword("secret", "different")).toBe(false);
  });

  it("uses secure admin cookies in production", () => {
    expect(getAdminCookieOptions({ NODE_ENV: "production" })).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/"
    });
    expect(getAdminCookieOptions({ NODE_ENV: "production" }).maxAge).toBeGreaterThan(0);
  });
});
