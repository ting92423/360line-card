-- ========================================
-- 360LINE 電子名片系統 - 用戶與訂閱管理
-- ========================================

-- 用戶表：管理所有用戶及其訂閱狀態
CREATE TABLE IF NOT EXISTS users (
  line_user_id VARCHAR(50) PRIMARY KEY,
  display_name VARCHAR(100),
  picture_url TEXT,
  email VARCHAR(255),
  
  -- 訂閱方案
  plan VARCHAR(20) DEFAULT 'trial' CHECK (plan IN ('trial', 'free', 'pro', 'enterprise')),
  
  -- 試用期管理
  trial_start_date TIMESTAMP DEFAULT NOW(),
  trial_expired_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  
  -- 付費訂閱管理
  subscription_start_date TIMESTAMP,
  subscription_expired_at TIMESTAMP,
  
  -- 權限設定
  max_cards INTEGER DEFAULT 1,
  allowed_templates TEXT[] DEFAULT ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'],
  
  -- 時間戳記
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- 訂單表：記錄所有付費交易
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  line_user_id VARCHAR(50) REFERENCES users(line_user_id),
  
  -- 訂單資訊
  plan VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'TWD',
  
  -- 付款狀態
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  payment_id VARCHAR(100),
  
  -- 時間戳記
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP
);

-- 名片瀏覽統計表
CREATE TABLE IF NOT EXISTS card_views (
  id SERIAL PRIMARY KEY,
  card_slug VARCHAR(50) NOT NULL,
  owner_line_user_id VARCHAR(50),
  
  -- 訪客資訊
  viewer_ip VARCHAR(45),
  viewer_user_agent TEXT,
  viewer_country VARCHAR(2),
  viewer_city VARCHAR(100),
  
  -- 互動類型
  action_type VARCHAR(20) DEFAULT 'view' CHECK (action_type IN ('view', 'click_phone', 'click_email', 'click_website', 'download_vcard', 'add_friend', 'share')),
  
  -- 時間戳記
  viewed_at TIMESTAMP DEFAULT NOW(),
  
  -- 建立索引以提升查詢效能
  INDEX idx_card_slug (card_slug),
  INDEX idx_owner (owner_line_user_id),
  INDEX idx_viewed_at (viewed_at)
);

-- 用戶活動日誌表
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id SERIAL PRIMARY KEY,
  line_user_id VARCHAR(50) REFERENCES users(line_user_id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (line_user_id),
  INDEX idx_created_at (created_at)
);

-- ========================================
-- 索引優化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_trial_expired ON users(trial_expired_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expired ON users(subscription_expired_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_line_user_id ON orders(line_user_id);

-- ========================================
-- 更新時間戳記觸發器
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 初始化資料（測試用）
-- ========================================
-- 測試用戶：試用中
INSERT INTO users (line_user_id, display_name, plan, trial_expired_at)
VALUES ('test_trial_user', '試用用戶', 'trial', NOW() + INTERVAL '7 days')
ON CONFLICT (line_user_id) DO NOTHING;

-- 測試用戶：已付費
INSERT INTO users (line_user_id, display_name, plan, subscription_expired_at, max_cards, allowed_templates)
VALUES ('test_pro_user', '專業用戶', 'pro', NOW() + INTERVAL '1 month', 10, ARRAY['default', 'chatbot-tw-1', 'corporate-buzz'])
ON CONFLICT (line_user_id) DO NOTHING;

-- 測試用戶：試用過期
INSERT INTO users (line_user_id, display_name, plan, trial_expired_at)
VALUES ('test_expired_user', '過期用戶', 'trial', NOW() - INTERVAL '1 day')
ON CONFLICT (line_user_id) DO NOTHING;
