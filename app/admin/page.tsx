import { AdminClient } from "./ui";

export default function AdminPage() {
  return (
    <main className="container">
      <div className="panel">
        <h1 style={{ margin: "0 0 10px" }}>名片後台（LIFF）</h1>
        <div className="muted" style={{ lineHeight: 1.75 }}>
          透過 LIFF 取得你的 LINE profile，並用「LINE userId」當作 slug 儲存名片。正式版建議改為 LINE Login +
          後端驗證 access token。
        </div>
      </div>

      <div style={{ height: 14 }} />
      <AdminClient />
    </main>
  );
}

