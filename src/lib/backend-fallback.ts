/* eslint-disable @typescript-eslint/no-explicit-any */
import { treaty } from "@elysiajs/eden";

/**
 * Fallback client for CI / Vercel builds where the backend repository
 * is not mounted locally. In local development with the backend repository,
 * TypeScript resolves @backend/client to the live Elysia App type.
 */
export type App = any;

export const createFinTrackClient = (
  baseUrl: string = "http://localhost:3000",
  config?: Parameters<typeof treaty<any>>[1]
) => {
  return treaty<any>(baseUrl, {
    ...config,
    fetch: {
      credentials: "include",
      ...config?.fetch,
    },
  });
};

export type FinTrackClient = ReturnType<typeof createFinTrackClient>;
