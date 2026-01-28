import { promises as fs } from "node:fs";
import path from "node:path";
import { EventSchema, type Event } from "@/lib/events";

type StoreShape = {
  events: Event[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "events.json");

async function ensureStoreFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    const initial: StoreShape = { events: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as StoreShape;
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.events)) return { events: [] };
  return parsed;
}

async function writeStore(store: StoreShape) {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function appendEvent(event: Event) {
  const validated = EventSchema.parse(event);
  const store = await readStore();
  store.events.push({ ...validated, ts: validated.ts ?? Date.now() });
  await writeStore(store);
}

