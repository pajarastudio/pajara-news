
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  category_id: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  return createClient(url, key);
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat kategori:", error.message);
    return null;
  }

  return data as Category | null;
}

async function getArticles(categoryId: string): Promise<Article[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select(`
      id,
      title,
      slug,
      summary,
      cover_image,
      published_at,
      created_at,
      category_id,
      category:news_categories (
        name,
        slug
      )
    `)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Gagal memuat artikel kategori:", error.message);
    return [];
  }

  return (data ?? []) as unknown as Article[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan",
    };
  }

  return {
    title: `${category.name} — Artikel`,
    description: `Temukan artikel, wawasan, dan inspirasi seputar ${category.name} di Pajara News.`,
    alternates: {
      canonical: `/kategori/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | Pajara News`,
      description: `Artikel pilihan seputar ${category.name} dari Pajara News.`,
      type: "website",
    },
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
}

function ArticlePlaceholder() {
  return (
    <div className="card-placeholder" aria-label="Ilustrasi artikel">
      P.
    </div>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticles(category.id);

  return (
    <main>
      <header className="topbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Pajara News beranda">
            <span className="brand-mark">P.</span>
            <span>
              <strong>PAJARA</strong>
              <small>NEWS & INSIGHT</small>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Navigasi utama">
            <Link href="/">Beranda</Link>
            <Link href="/#artikel">Artikel</Link>
            <Link href="/#tentang">Tentang</Link>
          </nav>
        </div>
      </header>

      <section className="container articles-section">
        <Link href="/" className="back-link">
          ← Kembali ke Beranda
        </Link>

        <div className="section-heading" style={{ marginTop: 35 }}>
          <div>
            <span className="section-label">JELAJAHI PAJARA NEWS</span>
            <h1 className="news-heading">{category.name}</h1>
          </div>

          <span className="article-count">
            {articles.length} ARTIKEL
          </span>
        </div>

        {articles.length > 0 ? (
          <div className="article-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.id}>
                <Link
                  href={`/artikel/${article.slug}`}
                  aria-label={`Baca ${article.title}`}
                >
                  <div className="card-image">
                    {article.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.cover_image}
                        alt={`Sampul ${article.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <ArticlePlaceholder />
                    )}
                  </div>
                </Link>

                <div className="card-body">
                  <span className="category-label">{category.name}</span>

                  <Link href={`/artikel/${article.slug}`}>
                    <h2 className="news-heading">{article.title}</h2>
                  </Link>

                  <p>
                    {article.summary || "Baca artikel selengkapnya di Pajara News."}
                  </p>

                  <div className="article-meta">
                    <span>
                      {formatDate(
                        article.published_at || article.created_at
                      )}
                    </span>

                    <Link
                      href={`/artikel/${article.slug}`}
                      className="read-link"
                    >
                      Baca Artikel →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✳</div>
            <h2 className="news-heading">Belum Ada Artikel</h2>
            <p>
              Artikel dalam kategori {category.name} sedang disiapkan.
              Silakan kembali lagi nanti untuk membaca wawasan terbaru.
            </p>
          </div>
        )}

        <div className="article-end">
          <span className="end-mark">P.</span>
          <p>Berakar di Tanah Pasundan.</p>
          <Link href="/" className="primary-button">
            Jelajahi Pajara News →
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">PAJARA NEWS</span>
          <span>
            © {new Date().getFullYear()} Pajara Studio. Seluruh hak cipta
            dilindungi.
          </span>
        </div>
      </footer>
    </main>
  );
}
