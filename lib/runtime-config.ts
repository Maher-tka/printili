type RuntimeEnv = {
  ADMIN_PASSWORD?: string;
  DATABASE_URL?: string;
  NODE_ENV?: string;
};

const placeholderDatabaseFragments = ["johndoe:randompassword@localhost:5432/mydb"];

export function isProductionRuntime(env: RuntimeEnv = process.env) {
  return env.NODE_ENV === "production";
}

export function getConfiguredAdminPassword(env: RuntimeEnv = process.env) {
  const password = env.ADMIN_PASSWORD?.trim();

  if (password) {
    return password;
  }

  if (isProductionRuntime(env)) {
    throw new Error("ADMIN_PASSWORD must be configured in production.");
  }

  return null;
}

export function hasConfiguredDatabaseUrl(env: RuntimeEnv = process.env) {
  const databaseUrl = env.DATABASE_URL?.trim();
  const isConfigured = Boolean(
    databaseUrl && !placeholderDatabaseFragments.some((fragment) => databaseUrl.includes(fragment))
  );

  if (isConfigured) {
    return true;
  }

  if (isProductionRuntime(env)) {
    throw new Error(
      "DATABASE_URL must be configured in production. Local JSON storage is development-only."
    );
  }

  return false;
}

export function getRequiredDatabaseUrl(env: RuntimeEnv = process.env) {
  if (!hasConfiguredDatabaseUrl(env)) {
    throw new Error("DATABASE_URL is required to create the Prisma client.");
  }

  return env.DATABASE_URL!.trim();
}

export function assertLocalJsonFallbackAllowed(
  featureName: string,
  env: RuntimeEnv = process.env
) {
  if (isProductionRuntime(env)) {
    throw new Error(
      `${featureName} local JSON storage is disabled in production. Configure DATABASE_URL.`
    );
  }
}

export function handleDatabaseFailure(
  context: string,
  error: unknown,
  env: RuntimeEnv = process.env
) {
  if (isProductionRuntime(env)) {
    const detail = error instanceof Error && error.message ? ` ${error.message}` : "";

    throw new Error(`${context}. Database persistence is required in production.${detail}`);
  }

  console.warn(`${context}; using local development store.`, error);
}
