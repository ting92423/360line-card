/**
 * AI 點數系統
 * 1 點 = 1 次 AI 生成
 * 新用戶免費贈送 50 點
 */

import { promises as fs } from "node:fs";
import path from "node:path";

// 點數常數設定
export const CREDITS_CONFIG = {
  FREE_CREDITS: 10,           // 新用戶免費贈送（足夠體驗，促進付費轉換）
  COST_PER_GENERATION: 1,     // 每次 AI 生成消耗點數
  MIN_TOPUP: 100,             // 最低儲值點數
  
  // 儲值方案
  TOPUP_PLANS: [
    { points: 100, price: 100, bonus: 0, label: '100 點' },
    { points: 300, price: 250, bonus: 50, label: '300 點（加贈 50 點）' },
    { points: 600, price: 450, bonus: 150, label: '600 點（加贈 150 點）' },
  ] as const,
  
  // 銀行帳戶資訊（從環境變數讀取，用於手動轉帳）
  get BANK_INFO() {
    return {
      bankName: process.env.BANK_NAME || '請設定銀行名稱',
      bankCode: process.env.BANK_CODE || '000',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '請設定帳號',
      accountName: process.env.BANK_ACCOUNT_NAME || 'DUO ID',
    };
  },
};

// 點數交易類型
export type CreditTransactionType = 
  | 'signup_bonus'      // 註冊贈送
  | 'ai_generation'     // AI 生成消耗
  | 'topup_pending'     // 儲值待確認
  | 'topup_confirmed'   // 儲值已確認
  | 'admin_grant'       // 管理員手動加點
  | 'refund';           // 退款

// 點數交易記錄
export interface CreditTransaction {
  id: string;
  lineUserId: string;
  type: CreditTransactionType;
  amount: number;           // 正數=增加, 負數=減少
  balance: number;          // 交易後餘額
  description: string;
  metadata?: {
    topupPlanIndex?: number;
    transferAmount?: number;
    transferLast5?: string;   // 轉帳帳號末 5 碼
    adminNote?: string;
  };
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 用戶點數資訊
export interface UserCredits {
  lineUserId: string;
  balance: number;
  totalEarned: number;      // 總獲得點數
  totalSpent: number;       // 總消耗點數
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 儲存結構
interface CreditsStoreShape {
  users: Record<string, UserCredits>;
  transactions: CreditTransaction[];
  pendingTopups: CreditTransaction[];  // 待確認的儲值請求
}

const DATA_DIR = path.join(process.cwd(), "data");
const CREDITS_PATH = path.join(DATA_DIR, "credits.json");

// 確保檔案存在
async function ensureCreditsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CREDITS_PATH);
  } catch {
    const initial: CreditsStoreShape = { 
      users: {}, 
      transactions: [],
      pendingTopups: []
    };
    await fs.writeFile(CREDITS_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readCreditsStore(): Promise<CreditsStoreShape> {
  await ensureCreditsFile();
  const raw = await fs.readFile(CREDITS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as CreditsStoreShape;
  if (!parsed || typeof parsed !== "object") {
    return { users: {}, transactions: [], pendingTopups: [] };
  }
  return {
    users: parsed.users || {},
    transactions: parsed.transactions || [],
    pendingTopups: parsed.pendingTopups || []
  };
}

async function writeCreditsStore(store: CreditsStoreShape) {
  await ensureCreditsFile();
  await fs.writeFile(CREDITS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 取得或建立用戶點數帳戶（新用戶自動贈送 50 點）
 */
export async function getOrCreateUserCredits(lineUserId: string): Promise<UserCredits> {
  const store = await readCreditsStore();
  
  if (store.users[lineUserId]) {
    return store.users[lineUserId];
  }
  
  // 新用戶 - 建立帳戶並贈送點數
  const now = new Date().toISOString();
  const newUser: UserCredits = {
    lineUserId,
    balance: CREDITS_CONFIG.FREE_CREDITS,
    totalEarned: CREDITS_CONFIG.FREE_CREDITS,
    totalSpent: 0,
    createdAt: now,
    updatedAt: now,
  };
  
  // 記錄贈送交易
  const bonusTransaction: CreditTransaction = {
    id: generateId(),
    lineUserId,
    type: 'signup_bonus',
    amount: CREDITS_CONFIG.FREE_CREDITS,
    balance: CREDITS_CONFIG.FREE_CREDITS,
    description: `新用戶註冊贈送 ${CREDITS_CONFIG.FREE_CREDITS} 點`,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  };
  
  store.users[lineUserId] = newUser;
  store.transactions.push(bonusTransaction);
  await writeCreditsStore(store);
  
  return newUser;
}

/**
 * 取得用戶點數餘額
 */
export async function getUserCreditsBalance(lineUserId: string): Promise<number> {
  const credits = await getOrCreateUserCredits(lineUserId);
  return credits.balance;
}

/**
 * 消耗點數（AI 生成時呼叫）
 */
export async function consumeCredits(
  lineUserId: string, 
  amount: number = CREDITS_CONFIG.COST_PER_GENERATION,
  description: string = 'AI 智能填寫'
): Promise<{ success: boolean; balance: number; message?: string }> {
  const store = await readCreditsStore();
  const user = store.users[lineUserId];
  
  if (!user) {
    return { success: false, balance: 0, message: '用戶不存在' };
  }
  
  if (user.balance < amount) {
    return { 
      success: false, 
      balance: user.balance, 
      message: `點數不足（需要 ${amount} 點，目前餘額 ${user.balance} 點）` 
    };
  }
  
  const now = new Date().toISOString();
  const newBalance = user.balance - amount;
  
  // 更新用戶餘額
  user.balance = newBalance;
  user.totalSpent += amount;
  user.lastUsedAt = now;
  user.updatedAt = now;
  
  // 記錄交易
  const transaction: CreditTransaction = {
    id: generateId(),
    lineUserId,
    type: 'ai_generation',
    amount: -amount,
    balance: newBalance,
    description,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  };
  
  store.transactions.push(transaction);
  await writeCreditsStore(store);
  
  return { success: true, balance: newBalance };
}

/**
 * 建立儲值請求（待管理員確認）
 */
export async function createTopupRequest(
  lineUserId: string,
  planIndex: number,
  transferLast5: string
): Promise<CreditTransaction> {
  const plan = CREDITS_CONFIG.TOPUP_PLANS[planIndex];
  if (!plan) {
    throw new Error('無效的儲值方案');
  }
  
  const store = await readCreditsStore();
  const user = await getOrCreateUserCredits(lineUserId);
  const now = new Date().toISOString();
  
  const transaction: CreditTransaction = {
    id: generateId(),
    lineUserId,
    type: 'topup_pending',
    amount: plan.points,
    balance: user.balance, // 尚未加點
    description: `儲值 ${plan.label}（NT$${plan.price}）`,
    metadata: {
      topupPlanIndex: planIndex,
      transferAmount: plan.price,
      transferLast5,
    },
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  
  store.pendingTopups.push(transaction);
  store.transactions.push(transaction);
  await writeCreditsStore(store);
  
  return transaction;
}

/**
 * 確認儲值（管理員操作）
 */
export async function confirmTopup(
  transactionId: string,
  adminNote?: string
): Promise<{ success: boolean; message: string }> {
  const store = await readCreditsStore();
  
  // 找到待確認的交易
  const pendingIndex = store.pendingTopups.findIndex(t => t.id === transactionId);
  if (pendingIndex === -1) {
    return { success: false, message: '找不到此儲值請求' };
  }
  
  const pending = store.pendingTopups[pendingIndex];
  const user = store.users[pending.lineUserId];
  
  if (!user) {
    return { success: false, message: '用戶不存在' };
  }
  
  const now = new Date().toISOString();
  const newBalance = user.balance + pending.amount;
  
  // 更新用戶餘額
  user.balance = newBalance;
  user.totalEarned += pending.amount;
  user.updatedAt = now;
  
  // 更新交易狀態
  pending.type = 'topup_confirmed';
  pending.balance = newBalance;
  pending.status = 'completed';
  pending.metadata = { ...pending.metadata, adminNote };
  pending.updatedAt = now;
  
  // 從待確認列表移除
  store.pendingTopups.splice(pendingIndex, 1);
  
  // 更新 transactions 中的對應記錄
  const txIndex = store.transactions.findIndex(t => t.id === transactionId);
  if (txIndex !== -1) {
    store.transactions[txIndex] = pending;
  }
  
  await writeCreditsStore(store);
  
  return { 
    success: true, 
    message: `已為用戶 ${pending.lineUserId} 加值 ${pending.amount} 點，新餘額 ${newBalance} 點` 
  };
}

/**
 * 取得待確認的儲值請求（管理員用）
 */
export async function getPendingTopups(): Promise<CreditTransaction[]> {
  const store = await readCreditsStore();
  return store.pendingTopups;
}

/**
 * 取得用戶交易記錄
 */
export async function getUserTransactions(
  lineUserId: string,
  limit: number = 20
): Promise<CreditTransaction[]> {
  const store = await readCreditsStore();
  return store.transactions
    .filter(t => t.lineUserId === lineUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * 管理員手動加點
 */
export async function adminGrantCredits(
  lineUserId: string,
  amount: number,
  adminNote: string
): Promise<{ success: boolean; balance: number; message: string }> {
  const store = await readCreditsStore();
  const user = await getOrCreateUserCredits(lineUserId);
  
  const now = new Date().toISOString();
  const newBalance = user.balance + amount;
  
  // 重新讀取以獲取最新資料
  const freshStore = await readCreditsStore();
  const freshUser = freshStore.users[lineUserId];
  
  freshUser.balance = newBalance;
  freshUser.totalEarned += amount;
  freshUser.updatedAt = now;
  
  const transaction: CreditTransaction = {
    id: generateId(),
    lineUserId,
    type: 'admin_grant',
    amount,
    balance: newBalance,
    description: `管理員手動加點：${adminNote}`,
    metadata: { adminNote },
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  };
  
  freshStore.transactions.push(transaction);
  await writeCreditsStore(freshStore);
  
  return { 
    success: true, 
    balance: newBalance,
    message: `成功加值 ${amount} 點，新餘額 ${newBalance} 點`
  };
}
