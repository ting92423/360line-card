"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 記錄錯誤（生產環境可改為送到錯誤追蹤服務如 Sentry）
    if (process.env.NODE_ENV === "development") {
      console.error("[App Error]", error);
    }
    // TODO: 生產環境可送到 Sentry 等服務
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 錯誤圖示 */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* 標題 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          發生錯誤
        </h1>

        {/* 說明 */}
        <p className="text-gray-600 mb-8">
          抱歉，發生了一些問題。
          <br />
          請重試一次或稍後再試。
        </p>

        {/* 行動按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            重試
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            返回首頁
          </a>
        </div>

        {/* 錯誤代碼（僅開發環境顯示） */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            錯誤代碼：{error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
