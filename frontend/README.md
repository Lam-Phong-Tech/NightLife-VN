# NightLife VN — Frontend Monorepo

Monorepo TypeScript dùng **pnpm workspaces** + **Turborepo**, app web viết bằng **Next.js 16 (App Router)** + **Tailwind CSS v4**.

## 📁 Cấu trúc

```
frontend/
├── apps/
│   └── web/                    # App Next.js (giao diện người dùng)
│       ├── src/app/            # App Router: thư mục = đường dẫn URL
│       │   ├── layout.tsx      # Khung HTML bao toàn bộ app
│       │   ├── page.tsx        # Trang "/"
│       │   └── globals.css     # CSS toàn cục + import Tailwind
│       ├── next.config.ts
│       ├── tsconfig.json       # extends @nightlife/typescript-config/nextjs.json
│       ├── eslint.config.mjs   # import @nightlife/eslint-config/next
│       └── postcss.config.mjs  # nạp plugin Tailwind v4
│
├── packages/
│   ├── typescript-config/      # tsconfig dùng chung (base/nextjs/react-library)
│   └── eslint-config/          # rule ESLint dùng chung (base/next)
│
├── package.json                # script chung + devDeps gốc (turbo, prettier, typescript)
├── pnpm-workspace.yaml         # khai báo workspace + duyệt build script
└── turbo.json                  # định nghĩa task & cache của Turborepo
```

## 🚀 Lệnh thường dùng

> Chạy ở thư mục gốc `frontend/`. Mọi lệnh đi qua Turborepo, áp dụng cho tất cả package.

| Lệnh | Tác dụng |
|------|----------|
| `pnpm install` | Cài deps cho cả monorepo (chỉ 1 lần ở gốc) |
| `pnpm dev` | Chạy dev server (http://localhost:3000) |
| `pnpm build` | Build production tất cả app |
| `pnpm start` | Chạy server production (sau khi `build`) |
| `pnpm lint` | Chạy ESLint |
| `pnpm check-types` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `pnpm format` | Format code bằng Prettier |

Chạy cho **một** package cụ thể:
```bash
pnpm --filter web dev        # chỉ chạy dev cho app web
```

## 🧠 Khái niệm cốt lõi

- **Workspace (pnpm):** nhiều package sống chung 1 repo, 1 lần `install`, liên kết nội bộ bằng `workspace:*`. Sửa code package dùng chung → app thấy ngay, không cần publish lên npm.
- **Turborepo:** điều phối task qua nhiều package, hiểu thứ tự phụ thuộc (`^build` = build dependency trước), và **cache** kết quả → chạy lại cực nhanh (`>>> FULL TURBO`).
- **App Router (Next.js):** cấu trúc thư mục trong `src/app/` chính là cấu trúc URL. Component mặc định là **Server Component**.
- **Tailwind v4:** không còn `tailwind.config.js`; cấu hình token ngay trong CSS bằng `@theme`, nạp qua `@import "tailwindcss";`.
- **Config dùng chung:** `tsconfig` và rule ESLint đặt 1 chỗ trong `packages/*`, các app `extends`/`import` → đồng bộ, sửa 1 nơi.

## ⚠️ Ghi chú phiên bản (quan trọng)

- **ESLint dùng bản 9.x** (không phải 10) vì `eslint-plugin-react` mà `eslint-config-next` kéo về chưa tương thích ESLint 10 (ESLint 10 đã bỏ API `context.getFilename()`). Khi hệ plugin cập nhật xong có thể nâng lên 10.
- **pnpm chặn build script** của dependency theo mặc định. Package cần build native (vd `sharp`, `unrs-resolver`) phải được duyệt trong `pnpm-workspace.yaml` (mục `allowBuilds`).

## ➕ Thêm app / package mới

1. Tạo thư mục trong `apps/` hoặc `packages/` kèm `package.json`.
2. Đặt tên scope `@nightlife/<tên>` để nhất quán.
3. Cần config chung thì thêm `"@nightlife/typescript-config": "workspace:*"` vào `devDependencies` rồi `extends` trong tsconfig.
4. Chạy `pnpm install` lại ở gốc để liên kết.
