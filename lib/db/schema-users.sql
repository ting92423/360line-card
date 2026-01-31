-- ========================================
-- 360LINE 電子名片系統 - 資料庫參考文檔
-- ========================================
-- 
-- ⚠️ 注意：此檔案僅為參考文檔！
-- 實際的 Schema 定義在 lib/db/schema.ts 中，
-- 系統啟動時會自動執行 ensureCoreSchema() 建立表結構。
-- 
-- 修改資料庫結構時，請編輯 schema.ts，而非此檔案。
-- ========================================

-- 用戶表：管理所有用戶及其訂閱狀態
-- 對應 schema.ts 中的 users 表
CREATE TABLE IF NOT EXISTS users (
  line_user_id TEXT PRIMARY KEY,
  display_name TEXT,
  picture_url TEXT,
  email TEXT,
  
  -- 訂閱方案
  plan TEXT NOT NULL DEFAULT 'trial',
  
  -- 試用期管理（欄位名稱已統一為 _at 結尾）
  trial_started_at TIMESTAMPTZ,
  trial_expired_at TIMESTAMPTZ,
  
  -- 付費訂閱管理
  subscription_started_at TIMESTAMPTZ,
  subscription_expired_at TIMESTAMPTZ,
  
  -- 權限設定
  max_cards INT NOT NULL DEFAULT 1,
  allowed_templates TEXT[] NOT NULL DEFAULT ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'],
  
  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 訂單表：記錄所有付費交易
-- 對應 schema.ts 中的 orders 表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  line_user_id TEXT REFERENCES users(line_user_id),
  
  -- 訂單資訊
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TWD',
  
  -- 付款狀態
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  
  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- 名片瀏覽統計表
-- 對應 schema.ts 中的 card_views 表
CREATE TABLE IF NOT EXISTS card_views (
  id SERIAL PRIMARY KEY,
  card_slug TEXT NOT NULL,
  owner_line_user_id TEXT,
  
  -- 訪客資訊
  viewer_ip TEXT,
  viewer_user_agent TEXT,
  viewer_country TEXT,
  viewer_city TEXT,
  
  -- 互動類型
  action_type TEXT NOT NULL DEFAULT 'view' CHECK (action_type IN ('view', 'click_phone', 'click_email', 'click_website', 'download_vcard', 'add_friend', 'share')),
  
  -- 時間戳記
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- card_views 索引（在 schema.ts 中以 CREATE INDEX IF NOT EXISTS 建立）
CREATE INDEX IF NOT EXISTS idx_card_views_slug ON card_views(card_slug);
CREATE INDEX IF NOT EXISTS idx_card_views_owner ON card_views(owner_line_user_id);
CREATE INDEX IF NOT EXISTS idx_card_views_viewed_at ON card_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_card_views_action ON card_views(action_type);

-- 用戶活動日誌表
-- 對應 schema.ts 中的 user_activity_logs 表
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id SERIAL PRIMARY KEY,
  line_user_id TEXT REFERENCES users(line_user_id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_activity_logs 索引
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_logs(line_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_logs(created_at);

-- ========================================
-- 額外索引優化（可選）
-- ========================================
-- 以下索引已在 schema.ts 中建立，此處僅供參考
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_trial_expired ON users(trial_expired_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expired ON users(subscription_expired_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(line_user_id);

-- ========================================
-- 更新時間戳記觸發器（可選，手動執行）
-- ========================================
-- 注意：schema.ts 中未包含此觸發器，如需使用請手動執行
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 users 表建立觸發器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 測試資料（開發環境用，請勿在生產環境執行）
-- ========================================
-- 測試用戶：試用中
INSERT INTO users (line_user_id, display_name, plan, trial_started_at, trial_expired_at)
VALUES ('test_trial_user', '試用用戶', 'trial', NOW(), NOW() + INTERVAL '7 days')
ON CONFLICT (line_user_id) DO NOTHING;

-- 測試用戶：已付費
INSERT INTO users (line_user_id, display_name, plan, subscription_started_at, subscription_expired_at, max_cards, allowed_templates)
VALUES ('test_pro_user', '專業用戶', 'pro', NOW(), NOW() + INTERVAL '1 month', 10, ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'])
ON CONFLICT (line_user_id) DO NOTHING;

-- 測試用戶：試用過期
INSERT INTO users (line_user_id, display_name, plan, trial_started_at, trial_expired_at)
VALUES ('test_expired_user', '過期用戶', 'trial', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day')
ON CONFLICT (line_user_id) DO NOTHING;
