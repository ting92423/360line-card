import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <span className="text-blue-400 text-sm font-medium">DUO ID 數位名片</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
          打造專屬於你的
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            LINE 數位名片
          </span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          選擇精美模板，快速建立個人品牌名片。一鍵分享到 LINE，讓人脈拓展更輕鬆。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/templates"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
          >
            立即體驗 →
          </Link>
          <Link
            href="/c/demo"
            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-medium rounded-2xl hover:bg-white/15 transition-all"
          >
            查看示範名片
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-bold mb-2">6 款精美模板</h3>
            <p className="text-gray-400 text-sm">
              講師、保險、企業、商務、美業、命理，總有一款適合你
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-bold mb-2">LINE 深度整合</h3>
            <p className="text-gray-400 text-sm">
              一鍵分享名片、加好友、存入通訊錄
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-2">即時編輯預覽</h3>
            <p className="text-gray-400 text-sm">
              所見即所得，修改立即呈現
            </p>
          </div>
        </div>
      </div>

      {/* How It Works - 使用流程引導 */}
      <div className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="text-green-400">3 步驟</span>快速建立名片
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-lg">1</div>
              <div className="text-3xl mb-3 mt-2">📱</div>
              <h3 className="text-lg font-bold mb-2">LINE 登入</h3>
              <p className="text-gray-400 text-sm">
                使用 LINE 帳號登入，安全又便利
              </p>
            </div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg">2</div>
              <div className="text-3xl mb-3 mt-2">🎨</div>
              <h3 className="text-lg font-bold mb-2">選擇模板</h3>
              <p className="text-gray-400 text-sm">
                瀏覽 6 款精美模板，選擇適合您的風格
              </p>
            </div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
              <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-lg">3</div>
              <div className="text-3xl mb-3 mt-2">🚀</div>
              <h3 className="text-lg font-bold mb-2">編輯發布</h3>
              <p className="text-gray-400 text-sm">
                填入資料，即時預覽，一鍵分享
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-4 pb-12">
        <div className="max-w-xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-4">快速連結</h3>
            <div className="space-y-3">
              {/* 我的名片 - 最重要的入口 */}
              <Link
                href="/editor"
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <span className="font-medium block">我的名片</span>
                    <span className="text-xs text-gray-400">編輯或查看您的名片</span>
                  </div>
                </div>
                <span className="text-blue-400">→</span>
              </Link>
              <Link
                href="/templates"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎨</span>
                  <span className="font-medium">瀏覽模板</span>
                </div>
                <span className="text-gray-500">→</span>
              </Link>
              <Link
                href="/upgrade"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">升級方案</span>
                </div>
                <span className="text-gray-500">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 text-center text-gray-500 text-sm border-t border-white/10">
        <p>DUO ID 數位名片 - 讓每一次交流都更有價值</p>
      </div>
    </main>
  );
}

