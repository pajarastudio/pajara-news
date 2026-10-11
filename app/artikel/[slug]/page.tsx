
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string | null;
  published_at: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
};

async function getArticle(slug: string): Promise<Article | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("news_articles")
    .select(`
      id,
      title,
      slug,
      summary,
      content,
      cover_image,
      published_at,
      category:news_categories(name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  return data as unknown as Article;
}

function formatDate(date: string | null) {
  if (!date) return "Pajara News";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      images: article.cover_image ? [article.cover_image] : [],
      publishedTime: article.published_at ?? undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <main className="article-page">
      <header className="topbar">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">P.</span>
            <span>
              <strong>PAJARA</strong>
              <small>NEWS & INSIGHTS</small>
            </span>
          </Link>
          <Link href="/" className="back-link">
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      <article className="container article-detail">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span>/</span>
          {article.category ? (
            <Link href={`/kategori/${article.category.slug}`}>
              {article.category.name}
            </Link>
          ) : (
            <span>Artikel</span>
          )}
        </nav>

        <header className="article-header">
          {article.category && (
            <span className="category-label">
              {article.category.name}
            </span>
          )}

          <h1 className="news-heading">{article.title}</h1>

          <p className="article-summary">{article.summary}</p>

          <div className="article-byline">
            <span>Redaksi Pajara News</span>
            <span>•</span>
            <time dateTime={article.published_at ?? undefined}>
              {formatDate(article.published_at)}
            </time>
          </div>
        </header>

        {article.cover_image && (
          <figure className="article-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image} alt={article.title} />
          </figure>
        )}

        <div className="article-body">
          {article.content.split(/\n{2,}/).map((paragraph, index) => {
            const trimmed = paragraph.trim();

            if (!trimmed) return null;

            if (trimmed.startsWith("## ")) {
              return (
                <h2 className="news-heading" key={index}>
                  {trimmed.replace(/^##\s+/, "")}
                </h2>
              );
            }

            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={index}>
                  {trimmed.replace(/^###\s+/, "")}
                </h3>
              );
            }

            return <p key={index}>{trimmed}</p>;
          })}
        </div>

        <div className="article-end">
          <span className="end-mark">P.</span>
          <p>Terus belajar. Terus bertumbuh.</p>
          <Link href="/" className="primary-button">
            Jelajahi Artikel Lainnya ↗
          </Link>
        </div>
      </article>

      <footer className="footer">
        <div className="container footer-inner">
          <Link href="/" className="footer-brand">PAJARA NEWS.</Link>
          <span>Bagian dari Pajara Studio</span>
          <span>© {new Date().getFullYear()} Pajara Studio</span>
        </div>
      </footer>
    </main>
  );
}
