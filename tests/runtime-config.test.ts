import { describe, expect, it } from "vitest";
import {
  getConfiguredAdminPassword,
  hasConfiguredDatabaseUrl,
  isProductionRuntime
} from "../lib/runtime-config";

describe("runtime config", () => {
  it("allows development to run without production-only secrets", () => {
    const env = {
      ADMIN_PASSWORD: undefined,
      DATABASE_URL: undefined,
      NODE_ENV: "development"
    };

    expect(isProductionRuntime(env)).toBe(false);
    expect(getConfiguredAdminPassword(env)).toBeNull();
    expect(hasConfiguredDatabaseUrl(env)).toBe(false);
  });

  it("requires ADMIN_PASSWORD in production", () => {
    expect(() =>
      getConfiguredAdminPassword({
        ADMIN_PASSWORD: undefined,
        DATABASE_URL: "postgresql://printili:test@localhost:5432/printili",
        NODE_ENV: "production"
      })
    ).toThrow("ADMIN_PASSWORD must be configured in production.");
  });

  it("requires DATABASE_URL in production", () => {
    expect(() =>
      hasConfiguredDatabaseUrl({
        ADMIN_PASSWORD: "secret",
        DATABASE_URL: undefined,
        NODE_ENV: "production"
      })
    ).toThrow("DATABASE_URL must be configured in production.");
  });
});
