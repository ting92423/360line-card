export async function ensureCoreSchema(query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>) {
  // users: 以 LINE userId 為主鍵（sub）
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      line_user_id TEXT PRIMARY KEY,
      display_name TEXT,
      picture_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // orgs + memberships（企業團購）
  await query(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_line_user_id TEXT NOT NULL REFERENCES users(line_user_id),
      default_template_id TEXT,
      banner_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orgs_owner ON orgs(owner_line_user_id);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS memberships (
      org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
      line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('owner','admin','member')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (org_id, line_user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(line_user_id);
  `);

  // templates（模板/企業統一）
  await query(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      theme_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // cards：多名片、可屬於 org
  await query(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      owner_line_user_id TEXT NOT NULL REFERENCES users(line_user_id),
      org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL,
      template_id TEXT REFERENCES templates(id),
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_cards_owner ON cards(owner_line_user_id);
    CREATE INDEX IF NOT EXISTS idx_cards_org ON cards(org_id);
  `);

  // subscriptions：方案/到期/功能開關（先做骨架）
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      org_id TEXT REFERENCES orgs(id) ON DELETE CASCADE,
      line_user_id TEXT REFERENCES users(line_user_id) ON DELETE CASCADE,
      plan_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','trialing')),
      current_period_end TIMESTAMPTZ,
      provider TEXT,
      provider_ref TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_subs_org ON subscriptions(org_id);
    CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(line_user_id);
  `);

  // events：分析用事件入庫
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      card_slug TEXT NOT NULL,
      actor_line_user_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_events_slug ON events(card_slug);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_line_user_id);
  `);
}

