import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Article = {
id: string;
title: string;
slug: string;
summary: string;
cover_image: string | null;
published_at: string | null;
category_id: string | null;
category?: {
name: string;
slug: string;
} | null;
};

async function getArticles(): Promise<Article[]> {
try {
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const key =
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

if (!url || !key) {
  console.error("PAJARA_DEBUG: Konfigurasi Supabase tidak tersedia.");
  return [];
}

const parsedUrl = new URL(url);

if (
  (parsedUrl.protocol !== "https:" &&
    parsedUrl.protocol !== "http:") ||
  !parsedUrl.hostname
) {
  console.error("PAJARA_DEBUG: URL Supabase tidak valid.");
  return [];
}

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from("news_articles")
  .select(
    "id, title, slug, summary, cover_image, published_at, category_id"
  )
  .eq("status", "published")
  .order("published_at", { ascending: false })
  .limit(12);

if (error) {
  console.error("PAJARA_DEBUG: Gagal mengambil artikel:", error.message);
  return [];
}

const articles = (data ?? []) as Article[];

const categoryIds = [
  ...new Set(
    articles
      .map((article) => article.category_id)
      .filter((id): id is string => Boolean(id))
  ),
];

if (categoryIds.length === 0) {
  return articles;
}

const { data: categories, error: categoryError } = await supabase
  .from("news_categories")
  .select("id, name, slug")
  .in("id", categoryIds);

if (categoryError) {
  console.error(
    "PAJARA_DEBUG: Gagal mengambil kategori:",
    categoryError.message
  );
  return articles;
}

const categoryMap = new Map(
  (categories ?? []).map((category) => [category.id, category])
);

return articles.map((article) => ({
  ...article,
  category: article.category_id
    ? categoryMap.get(article.category_id) ?? null
    : null,
}));

} catch (error) {
console.error(
"PAJARA_DEBUG: Kesalahan koneksi Supabase:",
error instanceof Error ? error.message : "Kesalahan tidak diketahui"
);
return [];
}
}

function formatDate(date: string | null) {
if (!date) return "Artikel Pajara News";

return new Intl.DateTimeFormat("id-ID", {
day: "numeric",
month: "long",
year: "numeric",
}).format(new Date(date));
}

export default async function HomePage() {
const articles = await getArticles();
const featured = articles[0];
const others = articles.slice(1);

return (
<main>
<header className="topbar">
<div className="container nav-inner">
<Link href="/" className="brand">
<span className="brand-mark">P.</span>
<span>
<strong>PAJARA</strong>
<small>NEWS & INSIGHTS</small>
</span>
</Link>

      &lt;nav className="nav-links"&gt;
        &lt;Link href="/"&gt;Beranda&lt;/Link&gt;
        &lt;a href="#artikel"&gt;Artikel&lt;/a&gt;
        &lt;a href="#tentang"&gt;Tentang&lt;/a&gt;
      &lt;/nav&gt;

      &lt;a className="nav-cta" href="#artikel"&gt;
        Jelajahi Artikel ↗
      &lt;/a&gt;
    &lt;/div&gt;
  &lt;/header&gt;

  &lt;section className="hero container"&gt;
    &lt;div className="hero-copy"&gt;
      &lt;span className="eyebrow"&gt;
        &lt;span className="eyebrow-dot" /&gt;
        RUANG WAWASAN PAJARA STUDIO
      &lt;/span&gt;

      &lt;h1&gt;
        Ide yang baik
        &lt;br /&gt;
        dimulai dari
        &lt;br /&gt;
        &lt;span&gt;rasa ingin tahu.&lt;/span&gt;
      &lt;/h1&gt;

      &lt;p&gt;
        Wawasan, edukasi, dan inspirasi tentang desain,
        kreativitas, teknologi, dan perjalanan bisnis
        di dunia digital.
      &lt;/p&gt;

      &lt;a className="primary-button" href="#artikel"&gt;
        Temukan Wawasan &lt;span&gt;↗&lt;/span&gt;
      &lt;/a&gt;

      &lt;div className="hero-note"&gt;
        &lt;span&gt;BERAKAR DI TANAH PASUNDAN&lt;/span&gt;
        &lt;span&gt;•&lt;/span&gt;
        &lt;span&gt;BERTUMBUH LEWAT PENGETAHUAN&lt;/span&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;div className="hero-art"&gt;
      &lt;div className="art-orbit orbit-one" /&gt;
      &lt;div className="art-orbit orbit-two" /&gt;

      &lt;div className="art-center"&gt;
        &lt;span className="art-small"&gt;RUANG UNTUK&lt;/span&gt;
        &lt;strong&gt;BERTUMBUH.&lt;/strong&gt;
        &lt;span className="art-line" /&gt;
        &lt;span className="art-caption"&gt;
          Pengetahuan membuka arah baru.
        &lt;/span&gt;
      &lt;/div&gt;

      &lt;span className="art-number"&gt;01 — 26&lt;/span&gt;
      &lt;span className="art-side-label"&gt;
        PAJARA NEWS / INDONESIA
      &lt;/span&gt;
    &lt;/div&gt;
  &lt;/section&gt;

  &lt;section className="intro-strip"&gt;
    &lt;div className="container intro-inner"&gt;
      &lt;span&gt;LEBIH DARI SEKADAR INFORMASI&lt;/span&gt;
      &lt;p&gt;Membaca untuk memahami. Belajar untuk berkembang.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/section&gt;

  &lt;section className="container articles-section" id="artikel"&gt;
    &lt;div className="section-heading"&gt;
      &lt;div&gt;
        &lt;span className="section-label"&gt;DARI RUANG REDAKSI&lt;/span&gt;
        &lt;h2 className="news-heading"&gt;Wawasan terbaru.&lt;/h2&gt;
      &lt;/div&gt;

      &lt;span className="article-count"&gt;
        {articles.length.toString().padStart(2, "0")} ARTIKEL
      &lt;/span&gt;
    &lt;/div&gt;

    {featured ? (
      &lt;Link href={`/artikel/${featured.slug}`} className="featured-card"&gt;
        &lt;div className="featured-image"&gt;
          {featured.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            &lt;img src={featured.cover_image} alt={featured.title} /&gt;
          ) : (
            &lt;div className="image-placeholder"&gt;
              &lt;span&gt;PAJARA&lt;/span&gt;
              &lt;strong&gt;NEWS.&lt;/strong&gt;
              &lt;small&gt;IDE • WAWASAN • INSPIRASI&lt;/small&gt;
            &lt;/div&gt;
          )}
          &lt;span className="image-badge"&gt;ARTIKEL PILIHAN&lt;/span&gt;
        &lt;/div&gt;

        &lt;div className="featured-copy"&gt;
          &lt;span className="category-label"&gt;
            {featured.category?.name ?? "Artikel"}
          &lt;/span&gt;
          &lt;h3 className="news-heading"&gt;{featured.title}&lt;/h3&gt;
          &lt;p&gt;{featured.summary}&lt;/p&gt;

          &lt;div className="article-meta"&gt;
            &lt;span&gt;{formatDate(featured.published_at)}&lt;/span&gt;
            &lt;span className="read-link"&gt;Baca artikel ↗&lt;/span&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/Link&gt;
    ) : (
      &lt;div className="empty-state"&gt;
        &lt;span className="empty-icon"&gt;✳&lt;/span&gt;
        &lt;h3 className="news-heading"&gt;
          Cerita pertama sedang disiapkan.
        &lt;/h3&gt;
        &lt;p&gt;
          Artikel yang diterbitkan melalui Pajara Admin
          akan muncul di ruang ini.
        &lt;/p&gt;
      &lt;/div&gt;
    )}

    {others.length &gt; 0 &amp;&amp; (
      &lt;div className="article-grid"&gt;
        {others.map((article) =&gt; (
          &lt;Link
            href={`/artikel/${article.slug}`}
            className="article-card"
            key={article.id}
          &gt;
            &lt;div className="card-image"&gt;
              {article.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                &lt;img src={article.cover_image} alt={article.title} /&gt;
              ) : (
                &lt;div className="card-placeholder"&gt;P.&lt;/div&gt;
              )}
            &lt;/div&gt;

            &lt;div className="card-body"&gt;
              &lt;span className="category-label"&gt;
                {article.category?.name ?? "Artikel"}
              &lt;/span&gt;
              &lt;h3 className="news-heading"&gt;{article.title}&lt;/h3&gt;
              &lt;p&gt;{article.summary}&lt;/p&gt;

              &lt;div className="article-meta"&gt;
                &lt;span&gt;{formatDate(article.published_at)}&lt;/span&gt;
                &lt;span&gt;↗&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/Link&gt;
        ))}
      &lt;/div&gt;
    )}
  &lt;/section&gt;

  &lt;section className="about-section" id="tentang"&gt;
    &lt;div className="container about-inner"&gt;
      &lt;span className="section-label"&gt;TENTANG PAJARA NEWS&lt;/span&gt;
      &lt;h2 className="news-heading"&gt;
        Pengetahuan punya cara untuk
        &lt;br /&gt;
        membawa kita lebih jauh.
      &lt;/h2&gt;
      &lt;p&gt;
        Pajara News adalah ruang berbagi wawasan dari Pajara
        Studio, untuk siapa pun yang ingin belajar, berkarya,
        dan berkembang di dunia digital.
      &lt;/p&gt;
      &lt;span className="about-signature"&gt;
        Berakar di Tanah Pasundan.
      &lt;/span&gt;
    &lt;/div&gt;
  &lt;/section&gt;

  &lt;footer className="footer"&gt;
    &lt;div className="container footer-inner"&gt;
      &lt;Link href="/" className="footer-brand"&gt;
        PAJARA NEWS.
      &lt;/Link&gt;
      &lt;span&gt;Bagian dari Pajara Studio&lt;/span&gt;
      &lt;span&gt;© {new Date().getFullYear()} Pajara Studio&lt;/span&gt;
    &lt;/div&gt;
  &lt;/footer&gt;
&lt;/main&gt;

);
}
