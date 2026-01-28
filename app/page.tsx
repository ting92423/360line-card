import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="panel">
        <h1 style={{ margin: "0 0 10px" }}>LINE 電子名片（MVP）</h1>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          這是一個對標「360line」的最小可行版本：在 LINE 內以 LIFF 開啟名片、支援一鍵分享、加好友與 vCard 下載。
        </p>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid">
        <div className="panel">
          <h2 style={{ margin: "0 0 10px" }}>快速開始</h2>
          <ol className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
            <li>建立 LINE Developers Channel 與 LIFF App（把 LIFF ID 填到環境變數）。</li>
            <li>用 LINE 內瀏覽器開啟名片頁：/c/&lt;slug&gt;</li>
            <li>用 /admin 以 LIFF 取得 profile，自動帶入資料並儲存。</li>
          </ol>

          <div style={{ height: 14 }} />
          <div className="row">
            <Link className="btn primary" href="/c/demo">
              開啟示範名片
            </Link>
            <Link className="btn" href="/admin">
              進入後台（LIFF）
            </Link>
          </div>
        </div>

        <div className="panel">
          <h2 style={{ margin: "0 0 10px" }}>你會得到什麼</h2>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
            <li>名片展示（RWD）、點擊撥號/寄信</li>
            <li>一鍵加好友（導向官方帳號）</li>
            <li>一鍵分享（ShareTargetPicker + Flex Message）</li>
            <li>vCard 下載（.vcf）</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

