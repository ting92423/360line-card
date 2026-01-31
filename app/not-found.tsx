import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 圖示 */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl font-bold text-white">404</span>
          </div>
        </div>

        {/* 標題 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          找不到頁面
        </h1>

        {/* 說明 */}
        <p className="text-gray-600 mb-8">
          抱歉，您要找的頁面不存在或已被移除。
          <br />
          請確認網址是否正確。
        </p>

        {/* 行動按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            返回首頁
          </Link>
          <Link
            href="/editor"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            建立名片
          </Link>
        </div>
      </div>
    </div>
  );
}
