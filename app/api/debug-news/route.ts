
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = getCloudflareContext();
    const env = context.env as typeof context.env & {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    };

    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      env.NEXT_PUBLIC_SUPABASE_URL;

    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return NextResponse.json({
        success: false,
        step: "environment",
        urlAvailable: Boolean(url),
        keyAvailable: Boolean(key),
      });
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("news_articles")
      .select("id, title, slug, status")
      .eq("slug", "mengenal-pajara-studio")
      .eq("status", "published")
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        step: "supabase-query",
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      step: "complete",
      articleFound: Boolean(data?.length),
      article: data?.[0] ?? null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      step: "runtime",
      error:
        error instanceof Error
          ? error.message
          : "Kesalahan tidak diketahui",
    });
  }
}
