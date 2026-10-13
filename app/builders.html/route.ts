import { standaloneResponse } from "@/lib/standalone";

// Standalone landing page; see lib/standalone.ts.
export const dynamic = "force-static";

export function GET() {
  return standaloneResponse("builders.html");
}
