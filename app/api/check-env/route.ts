
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const runtime = env as typeof env & {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    };

    const buildUrl = (
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
    ).trim();

    const runtimeUrl = (
      runtime.NEXT_PUBLIC_SUPABASE_URL ?? ""
    ).trim();

    const runtimeKey = (
      runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
    ).trim();

    const buildKey = (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
    ).trim();

    function validUrl(value: string) {
      try {
        const parsed = new URL(value);
        return (
          parsed.protocol === "https:" &&
          parsed.hostname.endsWith(".supabase.co")
        );
      } catch {
        return false;
      }
    }

    return NextResponse.json(
      {
        marker: "PAJARA_CHECK_ENV_V3",
        runtimeUrlAvailable: Boolean(runtimeUrl),
        runtimeUrlValid: validUrl(runtimeUrl),
        buildUrlAvailable: Boolean(buildUrl),
        buildUrlValid: validUrl(buildUrl),
        runtimeKeyAvailable: Boolean(runtimeKey),
        buildKeyAvailable: Boolean(buildKey),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        marker: "PAJARA_CHECK_ENV_V3",
        runtimeError: true,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
