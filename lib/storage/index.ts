import type { CardStore } from "@/lib/storage/adapter";
import { JsonCardStore } from "@/lib/storage/jsonStore";
import { PostgresCardStore } from "@/lib/storage/postgresStore";

let cached: CardStore | null = null;

export function getCardStore(): CardStore {
  if (cached) return cached;
  cached = process.env.DATABASE_URL ? new PostgresCardStore() : new JsonCardStore();
  return cached;
}

