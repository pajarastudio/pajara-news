
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
  category: {
    name: string;
    slug: string;
  } | null;
};

async function getArticles(): Promise<Article[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("news_articles")
      .select(`
        id,
        title,
        slug,
        summary,
        cover_image,
        published_at,
        category:news_categories(name, slug)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Gagal mengambil artikel:", error.message);
      return [];
    }

    return (data ?? []) as unknown as Article[];
  } catch {
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

          <nav className="nav-links">
            <Link href="/">Beranda</Link>
            <a href="#artikel">Artikel</a>
            <a href="#tentang">Tentang</a>
          </nav>

          <a className="nav-cta" href="#artikel">
            Jelajahi Artikel ↗
          </a>
        </div>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            RUANG WAWASAN PAJARA STUDIO
          </span>

          <h1>
            Ide yang baik
            <br />
            dimulai dari
            <br />
            <span>rasa ingin tahu.</span>
          </h1>

          <p>
            Wawasan, edukasi, dan inspirasi tentang desain,
            kreativitas, teknologi, dan perjalanan bisnis
            di dunia digital.
          </p>

          <a className="primary-button" href="#artikel">
            Temukan Wawasan <span>↗</span>
          </a>

          <div className="hero-note">
            <span>BERAKAR DI TANAH PASUNDAN</span>
            <span>•</span>
            <span>BERTUMBUH LEWAT PENGETAHUAN</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-center">
            <span className="art-small">RUANG UNTUK</span>
            <strong>BERTUMBUH.</strong>
            <span className="art-line" />
            <span className="art-caption">
              Pengetahuan membuka arah baru.
            </span>
          </div>
          <span className="art-number">01 — 26</span>
          <span className="art-side-label">PAJARA NEWS / INDONESIA</span>
        </div>
      </section>

      <section className="intro-strip">
        <div className="container intro-inner">
          <span>LEBIH DARI SEKADAR INFORMASI</span>
          <p>
            Membaca untuk memahami. Belajar untuk berkembang.
          </p>
        </div>
      </section>

      <section className="container articles-section" id="artikel">
        <div className="section-heading">
          <div>
            <span className="section-label">DARI RUANG REDAKSI</span>
            <h2 className="news-heading">Wawasan terbaru.</h2>
          </div>
          <span className="article-count">
            {articles.length.toString().padStart(2, "0")} ARTIKEL
          </span>
        </div>

        {featured ? (
          <Link
            href={`/artikel/${featured.slug}`}
            className="featured-card"
          >
            <div className="featured-image">
              {featured.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.cover_image} alt={featured.title} />
              ) : (
                <div className="image-placeholder">
                  <span>PAJARA</span>
                  <strong>NEWS.</strong>
                  <small>IDE • WAWASAN • INSPIRASI</small>
                </div>
              )}
              <span className="image-badge">ARTIKEL PILIHAN</span>
            </div>

            <div className="featured-copy">
              <span className="category-label">
                {featured.category?.name ?? "Artikel"}
              </span>
              <h3 className="news-heading">{featured.title}</h3>
              <p>{featured.summary}</p>
              <div className="article-meta">
                <span>{formatDate(featured.published_at)}</span>
                <span className="read-link">Baca artikel ↗</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">✳</span>
            <h3 className="news-heading">Cerita pertama sedang disiapkan.</h3>
            <p>
              Artikel yang diterbitkan melalui Pajara Admin
              akan muncul di ruang ini.
            </p>
          </div>
        )}

        {others.length > 0 && (
          <div className="article-grid">
            {others.map((article) => (
              <Link
                href={`/artikel/${article.slug}`}
                className="article-card"
                key={article.id}
              >
                <div className="card-image">
                  {article.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.cover_image} alt={article.title} />
                  ) : (
                    <div className="card-placeholder">P.</div>
                  )}
                </div>
                <div className="card-body">
                  <span className="category-label">
                    {article.category?.name ?? "Artikel"}
                  </span>
                  <h3 className="news-heading">{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="article-meta">
                    <span>{formatDate(article.published_at)}</span>
                    <span>↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="about-section" id="tentang">
        <div className="container about-inner">
          <span className="section-label">TENTANG PAJARA NEWS</span>
          <h2 className="news-heading">
            Pengetahuan punya cara untuk
            <br />
            membawa kita lebih jauh.
          </h2>
          <p>
            Pajara News adalah ruang berbagi wawasan dari Pajara
            Studio, untuk siapa pun yang ingin belajar, berkarya,
            dan berkembang di dunia digital.
          </p>
          <span className="about-signature">Berakar di Tanah Pasundan.</span>
        </div>
      </section>

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
