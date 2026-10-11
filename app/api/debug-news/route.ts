
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      {
        marker: "PAJARA_NEWS_DEBUG_V1",
        success: false,
        reason: "BUILD_CONFIG_MISSING",
        urlAvailable: Boolean(url),
        keyAvailable: Boolean(key),
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("news_articles")
      .select("id, title, slug, status, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({
        marker: "PAJARA_NEWS_DEBUG_V1",
        success: false,
        reason: "SUPABASE_QUERY_FAILED",
        errorCode: error.code,
        errorMessage: error.message,
      });
    }

    return NextResponse.json({
      marker: "PAJARA_NEWS_DEBUG_V1",
      success: true,
      count: data?.length ?? 0,
      articles: (data ?? []).map((article) => ({
        title: article.title,
        slug: article.slug,
        status: article.status,
        published_at: article.published_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        marker: "PAJARA_NEWS_DEBUG_V1",
        success: false,
        reason: "UNEXPECTED_ERROR",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
