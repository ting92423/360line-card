import type { Card } from "@/lib/types";
import { getCardStore } from "@/lib/storage";

// Back-compat wrapper：其餘程式碼仍可用 getCard/upsertCard
export async function getCard(slug: string): Promise<Card | null> {
  return await getCardStore().getCard(slug);
}

export async function upsertCard(input: Card): Promise<Card> {
  return await getCardStore().upsertCard(input);
}

