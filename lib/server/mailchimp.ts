import { createHash } from "node:crypto";
import { mailchimpConfig } from "./env";

export type SubscribeResult = "subscribed" | "skipped" | "failed";

/**
 * Adds or updates a list member (PUT, status_if_new: "subscribed"). Existing members keep their
 * status, so someone who unsubscribed is not silently re-subscribed. Returns "skipped" when
 * MAILCHIMP_API_KEY / MAILCHIMP_LIST_ID are not set.
 */
export async function subscribe(email: string): Promise<SubscribeResult> {
  const cfg = mailchimpConfig();
  if (!cfg) return "skipped";
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const url = `https://${cfg.dc}.api.mailchimp.com/3.0/lists/${encodeURIComponent(cfg.listId)}/members/${hash}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`funplay:${cfg.apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status_if_new: "subscribed" }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (res.ok) return "subscribed";
    let title = "";
    try {
      title = String(((await res.json()) as { title?: string }).title || "");
    } catch {}
    console.error(`[forms] Mailchimp subscribe failed: HTTP ${res.status} ${title.slice(0, 80)}`);
    return "failed";
  } catch (e) {
    console.error("[forms] Mailchimp unreachable:", (e as Error).message);
    return "failed";
  }
}
