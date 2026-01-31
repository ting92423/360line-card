/**
 * 用戶管理模組
 * 處理用戶註冊、權限檢查、訂閱狀態管理
 */

import { getCardStore } from "@/lib/storage/index";

export type UserPlan = 'trial' | 'free' | 'pro' | 'enterprise';

export interface User {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
  plan: UserPlan;
  trialStartDate?: Date;
  trialExpiredAt?: Date;
  subscriptionStartDate?: Date;
  subscriptionExpiredAt?: Date;
  maxCards: number;
  allowedTemplates: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPermissions {
  canEdit: boolean;
  canCreateNew: boolean;
  canUseTemplate: (templateId: string) => boolean;
  canViewAnalytics: boolean;
  maxCards: number;
  plan: UserPlan;
  status: 'active' | 'trial' | 'expired' | 'none';
  message?: string;
  daysRemaining?: number;
}

/**
 * 檢查用戶權限
 */
export function checkUserPermissions(user: User | null): UserPermissions {
  // 未登入或無用戶資料
  if (!user) {
    return {
      canEdit: false,
      canCreateNew: false,
      canUseTemplate: () => false,
      canViewAnalytics: false,
      maxCards: 0,
      plan: 'trial',
      status: 'none',
      message: '請先登入 LINE 帳號'
    };
  }

  const now = new Date();

  // 檢查試用期
  if (user.plan === 'trial') {
    if (user.trialExpiredAt && now > user.trialExpiredAt) {
      // 試用過期
      const daysExpired = Math.floor((now.getTime() - user.trialExpiredAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        canEdit: false,
        canCreateNew: false,
        canUseTemplate: () => false,
        canViewAnalytics: false,
        maxCards: user.maxCards,
        plan: user.plan,
        status: 'expired',
        message: `試用期已於 ${daysExpired} 天前結束，請升級繼續使用`,
        daysRemaining: 0
      };
    }

    // 試用中
    const daysRemaining = user.trialExpiredAt 
      ? Math.ceil((user.trialExpiredAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      canEdit: true,
      canCreateNew: true,
      canUseTemplate: (templateId) => user.allowedTemplates.includes(templateId),
      canViewAnalytics: true,
      maxCards: user.maxCards,
      plan: user.plan,
      status: 'trial',
      message: daysRemaining <= 3 ? `試用期剩餘 ${daysRemaining} 天` : undefined,
      daysRemaining
    };
  }

  // 檢查付費訂閱
  if (['pro', 'enterprise'].includes(user.plan)) {
    if (user.subscriptionExpiredAt && now > user.subscriptionExpiredAt) {
      // 訂閱過期
      return {
        canEdit: false,
        canCreateNew: false,
        canUseTemplate: () => false,
        canViewAnalytics: true, // 可以看舊資料
        maxCards: user.maxCards,
        plan: user.plan,
        status: 'expired',
        message: '訂閱已過期，請續約繼續使用',
        daysRemaining: 0
      };
    }

    // 付費用戶 - 完整權限
    const daysRemaining = user.subscriptionExpiredAt
      ? Math.ceil((user.subscriptionExpiredAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      canEdit: true,
      canCreateNew: true,
      canUseTemplate: (templateId) => user.allowedTemplates.includes(templateId),
      canViewAnalytics: true,
      maxCards: user.maxCards,
      plan: user.plan,
      status: 'active',
      message: daysRemaining <= 7 ? `訂閱將於 ${daysRemaining} 天後到期` : undefined,
      daysRemaining
    };
  }

  // 免費用戶（試用期已過期且未付費）
  // 只能查看，不能編輯或新建
  return {
    canEdit: false,
    canCreateNew: false,
    canUseTemplate: () => false,
    canViewAnalytics: false,
    maxCards: 0,
    plan: 'free',
    status: 'expired',
    message: '試用期已結束，請升級以繼續使用',
    daysRemaining: 0
  };
}

/**
 * 建立新用戶（首次加入）
 */
export async function createUser(lineUserId: string, displayName: string, pictureUrl?: string): Promise<User> {
  const store = getCardStore();
  
  // 如果使用 PostgreSQL，存入資料庫
  if ('createUser' in store && typeof (store as any).createUser === 'function') {
    return await (store as any).createUser(lineUserId, displayName, pictureUrl);
  }

  // JSON Store fallback
  const user: User = {
    lineUserId,
    displayName,
    pictureUrl,
    plan: 'trial',
    trialStartDate: new Date(),
    trialExpiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
    maxCards: 1,
    allowedTemplates: ['default', 'chatbot-tw-1', 'corporate-buzz'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return user;
}

/**
 * 取得用戶資訊
 */
export async function getUser(lineUserId: string): Promise<User | null> {
  const store = getCardStore();
  
  // 如果使用 PostgreSQL，從資料庫取得
  if ('getUser' in store && typeof (store as any).getUser === 'function') {
    return await (store as any).getUser(lineUserId);
  }

  // JSON Store fallback - 無用戶系統
  return null;
}

/**
 * 取得或建立用戶（自動試用）
 */
export async function getOrCreateUser(lineUserId: string, displayName: string, pictureUrl?: string): Promise<User> {
  let user = await getUser(lineUserId);
  if (!user) {
    user = await createUser(lineUserId, displayName, pictureUrl);
  }
  return user;
}

/**
 * 取得用戶名片數量
 */
export async function getUserCardCount(lineUserId: string): Promise<number> {
  const store = getCardStore();
  
  if ('getUserCardCount' in store && typeof (store as any).getUserCardCount === 'function') {
    return await (store as any).getUserCardCount(lineUserId);
  }

  // JSON Store fallback
  return 0;
}

/**
 * 更新用戶訂閱
 */
export async function upgradeUserPlan(
  lineUserId: string, 
  plan: UserPlan, 
  durationMonths: number = 1
): Promise<User> {
  const store = getCardStore();
  
  // 如果使用 PostgreSQL，更新資料庫
  if ('updateUserPlan' in store && typeof (store as any).updateUserPlan === 'function') {
    const user = await (store as any).updateUserPlan(lineUserId, plan, durationMonths);
    if (user) return user;
    throw new Error('User not found');
  }

  // JSON Store fallback - 不支援升級
  throw new Error('User upgrade requires database storage');
}

/**
 * 記錄用戶活動
 */
export async function logUserActivity(
  lineUserId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  const store = getCardStore();
  
  // 如果使用 PostgreSQL，記錄到資料庫
  if (store.constructor.name === 'PostgresCardStore') {
    // TODO: 實現活動日誌記錄
  }

  // 開發階段：輸出到 console
  console.log(`[User Activity] ${lineUserId}: ${action}`, details);
}

/**
 * 取得方案價格
 */
export function getPlanPrice(plan: UserPlan, billingCycle: 'monthly' | 'yearly' = 'monthly'): number {
  const prices = {
    trial: 0,
    free: 0,
    pro: billingCycle === 'monthly' ? 199 : 1990, // 年付 10 個月價格
    enterprise: billingCycle === 'monthly' ? 99 : 990 // 每人每月
  };

  return prices[plan];
}

/**
 * 取得方案特色
 */
export function getPlanFeatures(plan: UserPlan): string[] {
  const features: Record<UserPlan, string[]> = {
    trial: [
      '✅ 7天完整體驗',
      '✅ 3種精美樣板',
      '✅ 基礎名片功能',
      '✅ 無限分享',
      '⏰ 過期後只能查看'
    ],
    free: [
      '✅ 1張名片',
      '✅ 3種基礎樣板',
      '✅ 基本統計'
    ],
    pro: [
      '✅ 10張名片',
      '✅ 10+精美樣板',
      '✅ 詳細統計分析',
      '✅ 自訂短網址',
      '✅ vCard批量匯出'
    ],
    enterprise: [
      '✅ 無限名片',
      '✅ 所有樣板',
      '✅ 品牌客製化',
      '✅ 子網域設定',
      '✅ CRM整合',
      '✅ 專屬客服'
    ]
  };

  return features[plan] || [];
}
