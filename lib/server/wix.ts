import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function mimeFor(filename: string, fallback?: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return fallback || MIME[ext] || "application/octet-stream";
}

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

/** Uploads a file to the Wix Media Manager using the API key. */
export async function uploadToWixMedia(file: { filename: string; data: ArrayBuffer | Uint8Array; contentType?: string }) {
  const apiKey = env("WIX_API_KEY");
  const siteId = env("WIX_SITE_ID");
  const mimeType = mimeFor(file.filename, file.contentType);
  const headers = { Authorization: apiKey, "wix-site-id": siteId };

  const urlRes = await fetch("https://www.wixapis.com/site-media/v1/files/generate-upload-url", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType, fileName: file.filename, parentFolderId: process.env.WIX_MEDIA_FOLDER_ID || undefined }),
  });
  if (!urlRes.ok) throw new Error(`Wix generate-upload-url failed: ${urlRes.status} ${await urlRes.text()}`);
  const { uploadUrl } = (await urlRes.json()) as { uploadUrl: string };

  const body = new Blob([file.data as BlobPart], { type: mimeType });
  const upRes = await fetch(`${uploadUrl}?filename=${encodeURIComponent(file.filename)}`, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body,
  });
  if (!upRes.ok) throw new Error(`Wix media upload failed: ${upRes.status} ${await upRes.text()}`);

  const { file: uploaded } = (await upRes.json()) as { file: { id: string; url: string } };
  return { id: uploaded.id, url: uploaded.url };
}

let _wix: ReturnType<typeof makeClient> | null = null;

function makeClient() {
  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: env("WIX_CLIENT_ID") }),
  });
}

function wixClient() {
  return (_wix ??= makeClient());
}

/** Inserts an item into the CareerForm CMS collection. */
export async function insertCareerForm(data: Record<string, unknown>) {
  return wixClient().items.insert("CareerFormSubmissions", data);
}

/** Inserts an item into the ContactFormSubmissions CMS collection. */
export async function insertContactForm(data: Record<string, unknown>) {
  return wixClient().items.insert("ContactFormSubmissions", data);
}

/** Inserts an item into the NewsletterSubscribers CMS collection. */
export async function insertNewsletterSubscriber(data: Record<string, unknown>) {
  return wixClient().items.insert("NewsletterSubscribers", data);
}

/** Runs a Wix call without ever failing the request, and logs the real reason. */
export async function wixSafe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    const err = e as { message?: string; details?: unknown; code?: string };
    console.error(`[wix] ${label} failed:`, err.message, err.code ?? "", JSON.stringify(err.details ?? {}));
    return null;
  }
}