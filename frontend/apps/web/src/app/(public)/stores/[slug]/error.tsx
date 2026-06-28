"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="store-state-page">
      <section>
        <p>Không tải được thông tin quán.</p>
        <h1>Thử lại sau vài giây</h1>
        <div>
          <button type="button" onClick={reset}>
            Tải lại
          </button>
          <Link href="/danh-sach-quan">Về danh sách quán</Link>
        </div>
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
          color: #8ddbd4;
          font-weight: 900;
          margin: 0;
        }

        h1 {
          margin: 12px 0 22px;
          font-size: 34px;
          letter-spacing: 0;
        }

        div {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        button,
        a {
          min-height: 44px;
          border-radius: 8px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        button {
          border: 0;
          background: #e2b85e;
          color: #1b1508;
        }

        a {
          color: #f4dd9b;
          border: 1px solid rgba(226, 184, 94, .3);
        }
      `}</style>
    </main>
  );
}
