
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "30px 20px",
        background: "#f7f4ee",
        color: "#20251f",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: 460 }}>
        <div
          style={{
            width: 76,
            height: 76,
            margin: "0 auto 25px",
            display: "grid",
            placeItems: "center",
            borderRadius: 22,
            background: "#214d32",
            color: "#ffffff",
            fontFamily: "Georgia, serif",
            fontSize: 35,
            fontWeight: 700,
          }}
        >
          P.
        </div>

        <p
          style={{
            color: "#2f6b45",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
          }}
        >
          PAJARA NEWS
        </p>

        <h1
          style={{
            margin: "15px 0",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: "clamp(76px, 18vw, 120px)",
            lineHeight: 1,
            color: "#214d32",
          }}
        >
          404
        </h1>

        <h2
          style={{
            margin: "20px 0 12px",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 27,
            fontWeight: 600,
          }}
        >
          Halaman Belum Ditemukan
        </h2>

        <p
          style={{
            margin: "0 auto 28px",
            color: "#72776f",
            fontSize: 14,
            lineHeight: 1.9,
          }}
        >
          Sepertinya halaman yang Kang cari tidak tersedia atau alamatnya
          sudah berubah. Yuk, kembali dan temukan cerita lainnya di Pajara News.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px 22px",
            borderRadius: 5,
            background: "#214d32",
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ← Kembali ke Beranda
        </Link>

        <p
          style={{
            marginTop: 45,
            color: "#8a6a4a",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 15,
            fontStyle: "italic",
          }}
        >
          Berakar di Tanah Pasundan.
        </p>
      </section>
    </main>
  );
}
