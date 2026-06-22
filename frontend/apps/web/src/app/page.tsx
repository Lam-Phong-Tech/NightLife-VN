// Đây là trang ứng với đường dẫn "/" (vì nằm ở src/app/page.tsx).
// Trong App Router: cấu trúc thư mục = cấu trúc URL.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="bg-gradient-to-r from-[var(--color-neon-pink)] to-[var(--color-neon-cyan)] bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">
        NightLife VN
      </h1>

      <p className="max-w-md text-lg text-neutral-300">
        Monorepo <strong>Next.js + TypeScript + Tailwind</strong> đã sẵn sàng.
        Sửa file dưới đây để bắt đầu:
      </p>

      <code className="rounded-lg bg-night-800 px-4 py-2 font-mono text-sm text-neutral-200">
        apps/web/src/app/page.tsx
      </code>

      <div className="mt-4 flex gap-4 text-sm text-neutral-400">
        <span>⚡ Turborepo</span>
        <span>📦 pnpm workspaces</span>
        <span>🎨 Tailwind v4</span>
      </div>
    </main>
  );
}
