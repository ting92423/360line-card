const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://line360-card.vercel.app";

function assert(condition, message) {
  if (!condition) {
    const err = new Error(message);
    err.name = "SmokeTestError";
    throw err;
  }
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text };
}

function extractCssHrefs(html) {
  const hrefs = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    hrefs.push(m[1]);
  }
  return hrefs;
}

async function main() {
  const pageUrl = `${ORIGIN}/editor`;
  const { res, text: html } = await fetchText(pageUrl);
  assert(res.ok, `GET ${pageUrl} failed: HTTP ${res.status}`);

  // SSR should include visible strings
  assert(html.includes("DUO ID"), "HTML missing 'DUO ID' (unexpected SSR output)");
  assert(html.includes("DUO ID 編輯器"), "HTML missing 'DUO ID 編輯器'");
  assert(html.includes("基本資訊"), "HTML missing '基本資訊'");
  assert(html.includes("聯絡方式"), "HTML missing '聯絡方式'");

  const cssHrefs = extractCssHrefs(html);
  assert(cssHrefs.length > 0, "No stylesheet <link> found (Tailwind/CSS not loaded)");

  // Fetch the first CSS and verify Tailwind utility exists
  const cssUrl = cssHrefs[0].startsWith("http") ? cssHrefs[0] : `${ORIGIN}${cssHrefs[0]}`;
  const { res: cssRes, text: css } = await fetchText(cssUrl);
  assert(cssRes.ok, `GET CSS failed: ${cssUrl} HTTP ${cssRes.status}`);

  // Tailwind utility we rely on heavily
  assert(css.includes(".bg-gray-50"), "CSS does not include Tailwind utility '.bg-gray-50' (Tailwind not applied)");

  console.log("OK: /editor smoke test passed");
  console.log(`- page: ${pageUrl}`);
  console.log(`- css:  ${cssUrl}`);
}

main().catch((e) => {
  console.error("FAILED: /editor smoke test");
  console.error(e?.stack || String(e));
  process.exit(1);
});

