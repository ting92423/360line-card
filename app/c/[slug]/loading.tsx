/**
 * 名片頁面加載狀態
 */

export default function CardLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 骨架屏名片 */}
        <div className="rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
          <div className="p-8">
            {/* 頭像骨架 */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-gray-400" />
            </div>

            {/* 姓名骨架 */}
            <div className="text-center mb-6 space-y-3">
              <div className="h-8 w-32 bg-gray-400 rounded mx-auto" />
              <div className="h-5 w-24 bg-gray-400/70 rounded mx-auto" />
              <div className="h-4 w-20 bg-gray-400/50 rounded mx-auto" />
            </div>

            {/* 社群圖示骨架 */}
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-11 h-11 rounded-full bg-gray-400/50" />
              ))}
            </div>

            {/* 聯絡資訊骨架 */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-400/30 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* 加載文字 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">正在載入名片...</p>
        </div>
      </div>
    </div>
  );
}
