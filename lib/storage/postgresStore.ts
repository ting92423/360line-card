import type { Card } from "@/lib/types";
import { CardSchema } from "@/lib/types";
import type { CardStore } from "@/lib/storage/adapter";
import { ensureCoreSchema } from "@/lib/db/schema";

type PgClient = {
  query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>;
  end: () => Promise<void>;
};

async function getPgClient(): Promise<PgClient> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  // dynamic import：避免在未安裝 pg / 未啟用 DB 時影響本機開發
  const pg = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  return client as unknown as PgClient;
}

async function ensureSchema(client: PgClient) {
  await ensureCoreSchema(client.query.bind(client));
}

export class PostgresCardStore implements CardStore {
  async getCard(slug: string): Promise<Card | null> {
    const client = await getPgClient();
    try {
      await ensureSchema(client);
      const res = await client.query(`SELECT data FROM cards WHERE slug = $1`, [slug]);
      const row = res.rows[0];
      if (!row) return null;
      const validated = CardSchema.safeParse(row.data);
      return validated.success ? validated.data : null;
    } finally {
      await client.end();
    }
  }

  async upsertCard(card: Card): Promise<Card> {
    const validated = CardSchema.parse(card);
    const client = await getPgClient();
    try {
      await ensureSchema(client);
      const res = await client.query(
        `
        INSERT INTO cards (id, slug, data, owner_line_user_id, created_at, updated_at)
        VALUES ($1, $2, $3::jsonb, $4, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
          data = EXCLUDED.data,
          owner_line_user_id = EXCLUDED.owner_line_user_id,
          updated_at = NOW()
        RETURNING data;
        `,
        [
          // 不做 migration 工具前，先用 slug 當 id 的 deterministic 策略，避免空值
          `card_${validated.slug}`,
          validated.slug,
          JSON.stringify(validated),
          validated.ownerLineUserId ?? null
        ]
      );
      const row = res.rows[0];
      const saved = CardSchema.parse(row.data);
      return saved;
    } finally {
      await client.end();
    }
  }
}

