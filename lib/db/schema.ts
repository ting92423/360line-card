export async function ensureCoreSchema(query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>) {
  // users: 以 LINE userId 為主鍵（sub），包含訂閱資訊
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      line_user_id TEXT PRIMARY KEY,
      display_name TEXT,
      picture_url TEXT,
      email TEXT,
      plan TEXT NOT NULL DEFAULT 'trial',
      trial_started_at TIMESTAMPTZ,
      trial_expired_at TIMESTAMPTZ,
      subscription_started_at TIMESTAMPTZ,
      subscription_expired_at TIMESTAMPTZ,
      max_cards INT NOT NULL DEFAULT 1,
      allowed_templates TEXT[] NOT NULL DEFAULT ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'],
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 遷移：為舊 users 表加入新欄位（如果不存在）
  await query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan') THEN
        ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'trial';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_started_at') THEN
        ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_expired_at') THEN
        ALTER TABLE users ADD COLUMN trial_expired_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_started_at') THEN
        ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_expired_at') THEN
        ALTER TABLE users ADD COLUMN subscription_expired_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'max_cards') THEN
        ALTER TABLE users ADD COLUMN max_cards INT NOT NULL DEFAULT 1;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'allowed_templates') THEN
        ALTER TABLE users ADD COLUMN allowed_templates TEXT[] NOT NULL DEFAULT ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'];
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email TEXT;
      END IF;
    END $$;
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

  // card_views：名片瀏覽統計表
  await query(`
    CREATE TABLE IF NOT EXISTS card_views (
      id SERIAL PRIMARY KEY,
      card_slug TEXT NOT NULL,
      owner_line_user_id TEXT,
      viewer_ip TEXT,
      viewer_user_agent TEXT,
      viewer_country TEXT,
      viewer_city TEXT,
      action_type TEXT NOT NULL DEFAULT 'view' CHECK (action_type IN ('view', 'click_phone', 'click_email', 'click_website', 'download_vcard', 'add_friend', 'share')),
      viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_card_views_slug ON card_views(card_slug);
    CREATE INDEX IF NOT EXISTS idx_card_views_owner ON card_views(owner_line_user_id);
    CREATE INDEX IF NOT EXISTS idx_card_views_viewed_at ON card_views(viewed_at);
    CREATE INDEX IF NOT EXISTS idx_card_views_action ON card_views(action_type);
  `);

  // orders：訂單記錄表
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      line_user_id TEXT REFERENCES users(line_user_id),
      plan TEXT NOT NULL,
      amount INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'TWD',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
      payment_method TEXT,
      payment_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      refunded_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(line_user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  // user_activity_logs：用戶活動日誌表
  await query(`
    CREATE TABLE IF NOT EXISTS user_activity_logs (
      id SERIAL PRIMARY KEY,
      line_user_id TEXT REFERENCES users(line_user_id),
      action TEXT NOT NULL,
      details JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_logs(line_user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_logs(created_at);
  `);
}

