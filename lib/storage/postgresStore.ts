import type { Card } from "@/lib/types";
import { CardSchema } from "@/lib/types";
import type { CardStore, AnalyticsEvent, CardAnalytics } from "@/lib/storage/adapter";
import { ensureCoreSchema } from "@/lib/db/schema";
import type { User, UserPlan } from "@/lib/auth/userManager";

type QueryFn = (sql: string, params?: any[]) => Promise<{ rows: any[] }>;

// 連接池單例（模組層級快取）
let poolInstance: any = null;
let schemaInitialized = false;

/**
 * 獲取 PostgreSQL 連接池（單例模式）
 * 使用連接池避免每次操作都建立新連接，提升效能並防止連接洩漏
 */
async function getPool(): Promise<{ query: QueryFn }> {
  if (poolInstance) return poolInstance;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  // dynamic import：避免在未安裝 pg / 未啟用 DB 時影響本機開發
  const pg = await import("pg");
  
  poolInstance = new pg.Pool({
    connectionString: url,
    // 連接池配置
    max: 10,                    // 最大連接數
    min: 2,                     // 最小連接數
    idleTimeoutMillis: 30000,   // 閒置連接超時（30 秒）
    connectionTimeoutMillis: 5000, // 連接超時（5 秒）
    // 生產環境使用 SSL
    ssl: process.env.NODE_ENV === "production" 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  // 監聯連接池錯誤
  poolInstance.on("error", (err: Error) => {
    console.error("[PostgreSQL Pool] Unexpected error:", err.message);
  });

  return poolInstance;
}

/**
 * 確保 Schema 已初始化（只執行一次）
 */
async function ensureSchema(query: QueryFn): Promise<void> {
  if (schemaInitialized) return;
  await ensureCoreSchema(query);
  schemaInitialized = true;
}

export class PostgresCardStore implements CardStore {
  async getCard(slug: string): Promise<Card | null> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));
    
    const res = await pool.query(`SELECT data FROM cards WHERE slug = $1`, [slug]);
    const row = res.rows[0];
    if (!row) return null;
    
    const validated = CardSchema.safeParse(row.data);
    return validated.success ? validated.data : null;
  }

  async upsertCard(card: Card): Promise<Card> {
    const validated = CardSchema.parse(card);
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    const ownerId = validated.ownerLineUserId;
    
    // 注意：用戶必須已經存在（由 API 層的 getOrCreateUser 負責建立）
    // 這裡不再自動建立用戶，以確保付費牆檢查不被繞過
    
    const res = await pool.query(
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
        `card_${validated.slug}`,
        validated.slug,
        JSON.stringify(validated),
        ownerId || null,
      ]
    );
    
    const row = res.rows[0];
    const saved = CardSchema.parse(row.data);
    return saved;
  }

  // ========== 用戶管理方法 ==========

  async getUser(lineUserId: string): Promise<User | null> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    const res = await pool.query(
      `SELECT * FROM users WHERE line_user_id = $1`,
      [lineUserId]
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      lineUserId: row.line_user_id,
      displayName: row.display_name || '',
      pictureUrl: row.picture_url || undefined,
      email: row.email || undefined,
      plan: (row.plan || 'trial') as UserPlan,
      trialStartDate: row.trial_started_at ? new Date(row.trial_started_at) : undefined,
      trialExpiredAt: row.trial_expired_at ? new Date(row.trial_expired_at) : undefined,
      subscriptionStartDate: row.subscription_started_at ? new Date(row.subscription_started_at) : undefined,
      subscriptionExpiredAt: row.subscription_expired_at ? new Date(row.subscription_expired_at) : undefined,
      maxCards: row.max_cards || 1,
      allowedTemplates: row.allowed_templates || ['default', 'chatbot-tw-1', 'corporate-buzz'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    };
  }

  async createUser(lineUserId: string, displayName: string, pictureUrl?: string): Promise<User> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    const now = new Date();
    const trialExpiredAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 天後

    const res = await pool.query(
      `INSERT INTO users (line_user_id, display_name, picture_url, plan, trial_started_at, trial_expired_at, max_cards, created_at, updated_at)
       VALUES ($1, $2, $3, 'trial', NOW(), $4, 1, NOW(), NOW())
       ON CONFLICT (line_user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         picture_url = COALESCE(EXCLUDED.picture_url, users.picture_url),
         last_login_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [lineUserId, displayName, pictureUrl || null, trialExpiredAt]
    );

    const row = res.rows[0];
    return {
      lineUserId: row.line_user_id,
      displayName: row.display_name,
      pictureUrl: row.picture_url || undefined,
      plan: row.plan as UserPlan,
      trialStartDate: row.trial_started_at ? new Date(row.trial_started_at) : undefined,
      trialExpiredAt: row.trial_expired_at ? new Date(row.trial_expired_at) : undefined,
      maxCards: row.max_cards,
      allowedTemplates: row.allowed_templates || ['default', 'chatbot-tw-1', 'corporate-buzz'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getUserCardCount(lineUserId: string): Promise<number> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    const res = await pool.query(
      `SELECT COUNT(*) as count FROM cards WHERE owner_line_user_id = $1`,
      [lineUserId]
    );

    return parseInt(res.rows[0]?.count || '0', 10);
  }

  async updateUserPlan(lineUserId: string, plan: UserPlan, durationMonths: number = 1): Promise<User | null> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    const subscriptionExpiredAt = new Date();
    subscriptionExpiredAt.setMonth(subscriptionExpiredAt.getMonth() + durationMonths);

    const maxCards = plan === 'pro' ? 10 : plan === 'enterprise' ? 999 : 1;

    const res = await pool.query(
      `UPDATE users SET
         plan = $2,
         subscription_started_at = NOW(),
         subscription_expired_at = $3,
         max_cards = $4,
         updated_at = NOW()
       WHERE line_user_id = $1
       RETURNING *`,
      [lineUserId, plan, subscriptionExpiredAt, maxCards]
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      lineUserId: row.line_user_id,
      displayName: row.display_name,
      pictureUrl: row.picture_url || undefined,
      plan: row.plan as UserPlan,
      trialStartDate: row.trial_started_at ? new Date(row.trial_started_at) : undefined,
      trialExpiredAt: row.trial_expired_at ? new Date(row.trial_expired_at) : undefined,
      subscriptionStartDate: row.subscription_started_at ? new Date(row.subscription_started_at) : undefined,
      subscriptionExpiredAt: row.subscription_expired_at ? new Date(row.subscription_expired_at) : undefined,
      maxCards: row.max_cards,
      allowedTemplates: row.allowed_templates || ['default', 'chatbot-tw-1', 'corporate-buzz'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * 原子操作：建立名片並檢查數量限制
   * 使用 PostgreSQL 事務防止競態條件
   * 
   * @returns { success: true, card: Card } | { success: false, error: string, currentCount: number }
   */
  async createCardWithLimitCheck(
    card: Card, 
    ownerId: string, 
    maxCards: number
  ): Promise<{ success: true; card: Card } | { success: false; error: string; currentCount: number }> {
    const validated = CardSchema.parse(card);
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    // 使用 CTE 在單一查詢中完成檢查和插入，防止競態條件
    const res = await pool.query(
      `
      WITH card_count AS (
        SELECT COUNT(*) as cnt FROM cards WHERE owner_line_user_id = $4
      ),
      can_insert AS (
        SELECT (SELECT cnt FROM card_count) < $5 AS allowed
      ),
      inserted AS (
        INSERT INTO cards (id, slug, data, owner_line_user_id, created_at, updated_at)
        SELECT $1, $2, $3::jsonb, $4, NOW(), NOW()
        WHERE (SELECT allowed FROM can_insert)
        ON CONFLICT (slug) DO UPDATE SET
          data = EXCLUDED.data,
          owner_line_user_id = EXCLUDED.owner_line_user_id,
          updated_at = NOW()
        RETURNING data
      )
      SELECT 
        (SELECT allowed FROM can_insert) as allowed,
        (SELECT cnt FROM card_count) as current_count,
        (SELECT data FROM inserted) as card_data
      `,
      [
        `card_${validated.slug}`,
        validated.slug,
        JSON.stringify({ ...validated, ownerLineUserId: ownerId }),
        ownerId,
        maxCards,
      ]
    );

    const row = res.rows[0];
    
    if (!row.allowed) {
      return {
        success: false,
        error: "max_cards_reached",
        currentCount: parseInt(row.current_count || '0', 10),
      };
    }

    if (!row.card_data) {
      return {
        success: false,
        error: "insert_failed",
        currentCount: parseInt(row.current_count || '0', 10),
      };
    }

    const savedCard = CardSchema.parse(row.card_data);
    return { success: true, card: savedCard };
  }

  // ========== Analytics 統計方法 ==========

  /**
   * 記錄名片瀏覽/互動事件
   */
  async recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    await pool.query(
      `INSERT INTO card_views (
        card_slug, owner_line_user_id, viewer_ip, viewer_user_agent,
        viewer_country, viewer_city, action_type, viewed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        event.cardSlug,
        event.ownerLineUserId || null,
        event.viewerIp || null,
        event.viewerUserAgent || null,
        event.viewerCountry || null,
        event.viewerCity || null,
        event.actionType || 'view',
      ]
    );
  }

  /**
   * 獲取名片統計資料
   * @param slug 名片 slug
   * @param days 統計天數（預設 30 天）
   */
  async getCardAnalytics(slug: string, days: number = 30): Promise<CardAnalytics> {
    const pool = await getPool();
    await ensureSchema(pool.query.bind(pool));

    // 總瀏覽數
    const totalRes = await pool.query(
      `SELECT COUNT(*) as total FROM card_views WHERE card_slug = $1`,
      [slug]
    );
    const totalViews = parseInt(totalRes.rows[0]?.total || '0', 10);

    // 獨立訪客數（依 IP 統計）
    const uniqueRes = await pool.query(
      `SELECT COUNT(DISTINCT viewer_ip) as unique_visitors 
       FROM card_views 
       WHERE card_slug = $1 AND viewer_ip IS NOT NULL`,
      [slug]
    );
    const uniqueVisitors = parseInt(uniqueRes.rows[0]?.unique_visitors || '0', 10);

    // 各類型互動次數
    const actionsRes = await pool.query(
      `SELECT action_type, COUNT(*) as count 
       FROM card_views 
       WHERE card_slug = $1 
       GROUP BY action_type`,
      [slug]
    );
    const actions: Record<string, number> = {};
    for (const row of actionsRes.rows) {
      actions[row.action_type] = parseInt(row.count, 10);
    }

    // 按日期統計瀏覽量（最近 N 天）
    const viewsByDateRes = await pool.query(
      `SELECT DATE(viewed_at) as date, COUNT(*) as views 
       FROM card_views 
       WHERE card_slug = $1 AND viewed_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(viewed_at) 
       ORDER BY date DESC 
       LIMIT 30`,
      [slug]
    );
    const viewsByDate = viewsByDateRes.rows.map((row) => ({
      date: row.date instanceof Date 
        ? row.date.toISOString().split('T')[0] 
        : String(row.date),
      views: parseInt(row.count || row.views, 10),
    }));

    // 地區統計（前 10 名）
    const locationsRes = await pool.query(
      `SELECT 
        COALESCE(viewer_country, 'Unknown') as country,
        COALESCE(viewer_city, 'Unknown') as city,
        COUNT(*) as views 
       FROM card_views 
       WHERE card_slug = $1 
       GROUP BY viewer_country, viewer_city 
       ORDER BY views DESC 
       LIMIT 10`,
      [slug]
    );
    const topLocations = locationsRes.rows.map((row) => ({
      country: row.country || 'Unknown',
      city: row.city || 'Unknown',
      views: parseInt(row.views, 10),
    }));

    return {
      slug,
      totalViews,
      uniqueVisitors,
      actions,
      viewsByDate,
      topLocations,
    };
  }
}

