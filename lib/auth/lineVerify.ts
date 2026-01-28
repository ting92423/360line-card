import { z } from "zod";

const VerifyResponseSchema = z.object({
  scope: z.string().optional(),
  client_id: z.string().optional(),
  expires_in: z.number().optional(),
  // `sub` 是 LINE userId
  sub: z.string(),
  name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string().optional(),
  aud: z.string().optional(),
  iss: z.string().optional()
});

export async function verifyLineIdToken(idToken: string) {
  const channelId = process.env.LINE_CHANNEL_ID;
  if (!channelId) throw new Error("Missing LINE_CHANNEL_ID");

  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: channelId
    })
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof json?.error_description === "string" ? json.error_description : "line_verify_failed";
    throw new Error(msg);
  }

  const parsed = VerifyResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error("line_verify_invalid_response");
  return parsed.data;
}

