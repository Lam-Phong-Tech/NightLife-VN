export default function Loading() {
  return (
    <main className="store-loading">
      <section className="loading-hero">
        <div className="loading-media" />
        <div className="loading-copy">
          <span />
          <h1 />
          <p />
          <p />
          <div />
        </div>
      </section>
      <section className="loading-body">
        <div />
        <div />
        <div />
      </section>
      <style>{`
        .store-loading {
          min-height: 100vh;
          background: #0d0e11;
          color: #f7f1e7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .loading-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr);
          min-height: 520px;
        }

        .loading-media,
        .loading-copy span,
        .loading-copy h1,
        .loading-copy p,
        .loading-copy div,
        .loading-body div {
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(226,184,94,.14), rgba(255,255,255,.06));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .loading-media {
          min-height: 520px;
          border-radius: 0;
        }

        .loading-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
          padding: 56px;
          background: #111217;
        }

        .loading-copy span {
          width: 120px;
          height: 28px;
        }

        .loading-copy h1 {
          width: 72%;
          height: 58px;
          margin: 0;
        }

        .loading-copy p {
          width: 100%;
          height: 18px;
          margin: 0;
        }

        .loading-copy p:nth-of-type(2) {
          width: 82%;
        }

        .loading-copy div {
          width: 260px;
          height: 48px;
          margin-top: 10px;
        }

        .loading-body {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .loading-body div {
          height: 140px;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @media (max-width: 820px) {
          .loading-hero,
          .loading-body {
            grid-template-columns: 1fr;
          }

          .loading-media {
            min-height: 280px;
          }

          .loading-copy {
            padding: 28px 20px;
          }
        }
      `}</style>
    </main>
  );
}
