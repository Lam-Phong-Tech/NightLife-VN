import Link from "next/link";

export default function NotFound() {
  return (
    <main className="store-state-page">
      <section>
        <p>404</p>
        <h1>Không tìm thấy quán</h1>
        <span>Slug này không tồn tại hoặc quán chưa được công khai.</span>
        <Link href="/danh-sach-quan">Xem danh sách quán</Link>
      </section>
      <style>{`
        .store-state-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #0d0e11;
          color: #f7f1e7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        section {
          max-width: 480px;
          text-align: center;
        }

        p {
          color: #e2b85e;
          font-size: 15px;
          font-weight: 900;
          margin: 0;
        }

        h1 {
          margin: 12px 0 10px;
          font-size: 34px;
          letter-spacing: 0;
        }

        span {
          color: #bfb7aa;
          line-height: 1.6;
          display: block;
        }

        a {
          margin-top: 24px;
          min-height: 44px;
          border-radius: 8px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e2b85e;
          color: #1b1508;
          font-weight: 900;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
