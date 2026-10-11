
import Image from "next/image";
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

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      console.error("PAJARA_DEBUG: URL Supabase tidak valid.");
      return [];
    }

    if (
      parsedUrl.protocol !== "https:" ||
      !parsedUrl.hostname.endsWith(".supabase.co")
    ) {
      console.error("PAJARA_DEBUG: URL proyek Supabase tidak valid.");
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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Artikel Pajara News";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export default async function HomePage() {
  const articles = await getArticles();
  const featured = articles[0];
  const others = articles.slice(1);

  return (
    <main>
      <header className="topbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Pajara News, beranda">
            <Image
              src="/icon-192.png"
              alt="Logo Pajara Studio"
              className="brand-logo"
              width={48}
              height={48}
              priority
            />

            <span>
              <strong>PAJARA NEWS</strong>
              <small>RUANG WAWASAN &amp; KREATIVITAS</small>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Navigasi utama">
            <Link href="/">Beranda</Link>
            <a href="#artikel">Artikel</a>
            <a href="#tentang">Tentang</a>
          </nav>

          <a className="nav-cta" href="#artikel">
            Jelajahi Artikel <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            DARI TANAH PASUNDAN, UNTUK IDE YANG TERUS TUMBUH
          </span>

          <h1>
            Setiap ide
            <br />
            punya ruang
            <br />
            <span>untuk tumbuh.</span>
          </h1>

          <p>
            Catatan tentang desain, kreativitas, teknologi, dan perjalanan
            membangun sesuatu yang berarti. Dirangkum untuk menemani proses
            belajar dan berkarya.
          </p>

          <a className="primary-button" href="#artikel">
            Jelajahi Wawasan <span aria-hidden="true">↗</span>
          </a>

          <div className="hero-note">
            <span>BERAKAR DI TANAH PASUNDAN</span>
            <span aria-hidden="true">•</span>
            <span>BERTUMBUH LEWAT PENGETAHUAN</span>
          </div>
        </div>

        <div
          className="hero-art"
          role="img"
          aria-label="Grafis editorial Pajara News tentang pertumbuhan ide"
        >
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />

          <div className="art-center">
            <span className="art-small">SEBUAH RUANG UNTUK</span>
            <strong>BERTUMBUH.</strong>
            <span className="art-line" />
            <span className="art-caption">
              Pengetahuan membuka arah baru.
            </span>
          </div>

          <span className="art-number">PAJARA / 01</span>
          <span className="art-side-label">IDE • KARYA • PERJALANAN</span>
        </div>
      </section>

      <section className="intro-strip">
        <div className="container intro-inner">
          <span>LEBIH DARI SEKADAR INFORMASI</span>
          <p>Membaca untuk memahami. Belajar untuk berkembang.</p>
        </div>
      </section>

      <section className="container articles-section" id="artikel">
        <div className="section-heading">
          <div>
            <span className="section-label">DARI RUANG REDAKSI</span>
            <h2 className="news-heading">Cerita yang layak dibaca.</h2>
          </div>

          <span className="article-count">
            {articles.length.toString().padStart(2, "0")} ARTIKEL
          </span>
        </div>

        {featured ? (
          <Link href={`/artikel/${featured.slug}`} className="featured-card">
            <div className="featured-image">
              {featured.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.cover_image} alt={featured.title} />
              ) : (
                <div className="image-placeholder">
                  <span>RUANG WAWASAN</span>
                  <strong>PAJARA.</strong>
                  <small>IDE • KARYA • PERJALANAN</small>
                </div>
              )}

              <span className="image-badge">PILIHAN REDAKSI</span>
            </div>

            <div className="featured-copy">
              <span className="category-label">
                {featured.category?.name ?? "Artikel"}
              </span>

              <h3 className="news-heading">{featured.title}</h3>

              <p>{featured.summary}</p>

              <div className="article-meta">
                <span>{formatDate(featured.published_at)}</span>
                <span className="read-link">
                  Baca cerita <span aria-hidden="true">↗</span>
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ✳
            </span>

            <h3 className="news-heading">
              Cerita pertama sedang disiapkan.
            </h3>

            <p>
              Artikel yang diterbitkan melalui Pajara Admin akan muncul di
              ruang ini. Sampai saat itu, selalu ada ide baru untuk
              ditumbuhkan.
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
                    <span aria-hidden="true">↗</span>
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
            Berakar di tempat kita.
            <br />
            Bertumbuh melampaui batas.
          </h2>

          <p>
            Pajara News adalah ruang berbagi wawasan dari Pajara Studio.
            Tempat untuk merawat rasa ingin tahu, memahami proses kreatif,
            dan menemukan sudut pandang baru dalam perjalanan berkarya di
            dunia digital.
          </p>

          <span className="about-signature">
            Berakar di Tanah Pasundan.
          </span>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <Link href="/" className="footer-brand">
            PAJARA NEWS.
          </Link>

          <span>Bagian dari Pajara Studio</span>
          <span>© {new Date().getFullYear()} Pajara Studio</span>
        </div>
      </footer>
    </main>
  );
}
