/**
 * 模板選擇頁面加載狀態
 */

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header 骨架 */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-4">
          <div className="h-7 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-60 bg-white/5 rounded mt-2 animate-pulse" />
        </div>
      </div>

      {/* 模板骨架 */}
      <div className="px-4 py-8">
        <div className="max-w-sm mx-auto">
          <div 
            className="rounded-2xl bg-white/5 animate-pulse"
            style={{ aspectRatio: "9/16" }}
          />
        </div>
      </div>

      {/* 底部按鈕骨架 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
        <div className="h-14 bg-white/10 rounded-2xl animate-pulse" />
      </div>

      {/* 加載文字 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/60 text-sm">正在載入模板...</div>
      </div>
    </div>
  );
}
