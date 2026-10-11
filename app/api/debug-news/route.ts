
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const runtimeEnv = env as typeof env & {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    };

    const runtimeUrl = runtimeEnv.NEXT_PUBLIC_SUPABASE_URL;
    const buildUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const url = (runtimeUrl || buildUrl || "").trim();
    const key = (
      runtimeEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    let validUrl = false;

    try {
      const parsed = new URL(url);
      validUrl =
        (parsed.protocol === "https:" ||
          parsed.protocol === "http:") &&
        Boolean(parsed.hostname);
    } catch {
      validUrl = false;
    }

    if (!url || !key || !validUrl) {
      return NextResponse.json(
        {
          success: false,
          step: "environment",
          runtimeUrlAvailable: Boolean(runtimeUrl),
          buildUrlAvailable: Boolean(buildUrl),
          keyAvailable: Boolean(key),
          urlValid: validUrl,
          runtimeUrlValid: isValidUrl(runtimeUrl),
          buildUrlValid: isValidUrl(buildUrl),
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("news_articles")
      .select("id, title, slug, status")
      .eq("slug", "mengenal-pajara-studio")
      .eq("status", "published")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          step: "supabase-query",
          error: error.message,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        step: "complete",
        articleFound: Boolean(data?.length),
        article: data?.[0] ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        step: "runtime",
        error:
          error instanceof Error
            ? error.message
            : "Kesalahan tidak diketahui",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

function isValidUrl(value?: string) {
  if (!value?.trim()) return false;

  try {
    const parsed = new URL(value.trim());
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}
