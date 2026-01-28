import type { Card } from "@/lib/types";

function sanitize(text: string) {
  // vCard 用 CRLF，並避免換行破壞格式
  return text.replace(/\r?\n/g, " ").trim();
}

export function cardToVCard(card: Card) {
  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");
  lines.push(`FN:${sanitize(card.displayName)}`);
  if (card.company) lines.push(`ORG:${sanitize(card.company)}`);
  if (card.title) lines.push(`TITLE:${sanitize(card.title)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${sanitize(card.phone)}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${sanitize(card.email)}`);
  if (card.website) lines.push(`URL:${sanitize(card.website)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

