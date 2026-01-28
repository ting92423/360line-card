import { CardSchema, type Card } from "@/lib/types";
import type { CardStore } from "@/lib/storage/adapter";
import { promises as fs } from "node:fs";
import path from "node:path";

type StoreShape = {
  cards: Record<string, Card>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "cards.json");

async function ensureStoreFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    const initial: StoreShape = { cards: {} };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as StoreShape;
  if (!parsed || typeof parsed !== "object" || !parsed.cards) return { cards: {} };
  return parsed;
}

async function writeStore(store: StoreShape) {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export class JsonCardStore implements CardStore {
  async getCard(slug: string): Promise<Card | null> {
    const store = await readStore();
    const card = store.cards[slug];
    if (!card) return null;
    const validated = CardSchema.safeParse(card);
    return validated.success ? validated.data : null;
  }

  async upsertCard(input: Card): Promise<Card> {
    const validated = CardSchema.parse(input);
    const store = await readStore();
    const now = new Date().toISOString();
    const prev = store.cards[validated.slug];
    const next: Card = {
      ...validated,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now
    };
    store.cards[validated.slug] = next;
    await writeStore(store);
    return next;
  }
}

