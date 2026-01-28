import type { Card } from "@/lib/types";

export interface CardStore {
  getCard(slug: string): Promise<Card | null>;
  upsertCard(card: Card): Promise<Card>;
}

