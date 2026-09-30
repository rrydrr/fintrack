import { createFinTrackClient, type App, type FinTrackClient } from "@backend/client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = createFinTrackClient(API_URL);
export const client = api;

export type { App, FinTrackClient };
