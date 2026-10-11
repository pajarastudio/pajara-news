
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pajara-news.pages.dev"
).replace(/\/+$/, "");

type Article = {
  slug: string;
  updated_at: string;
  published_at: string | null;
};

type Category = {
  slug: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return pages;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("news_articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false }),

    supabase
      .from("news_categories")
      .select("slug")
      .order("name", { ascending: true }),
  ]);

  if (!articlesResult.error) {
    const articles = (articlesResult.data ?? []) as Article[];

    for (const article of articles) {
      pages.push({
        url: `${SITE_URL}/artikel/${article.slug}`,
        lastModified: new Date(
          article.updated_at || article.published_at || new Date().toISOString()
        ),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } else {
    console.error(
      "Gagal memuat artikel untuk sitemap:",
      articlesResult.error.message
    );
  }

  if (!categoriesResult.error) {
    const categories = (categoriesResult.data ?? []) as Category[];

    for (const category of categories) {
      pages.push({
        url: `${SITE_URL}/kategori/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } else {
    console.error(
      "Gagal memuat kategori untuk sitemap:",
      categoriesResult.error.message
    );
  }

  return pages;
}
