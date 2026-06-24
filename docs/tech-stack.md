# NightLife-VN - Tech Stack

Tài liệu này liệt kê chi tiết các công nghệ (Tech Stack) được sử dụng trong toàn bộ dự án NightLife-VN.

---

## 🏗️ 1. Backend (Đã thiết lập)

Backend được xây dựng dựa trên kiến trúc Modular và RESTful API.

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Framework chính:** [NestJS](https://nestjs.com/) (Node.js framework giúp xây dựng server có khả năng mở rộng tốt).
- **Package Manager:** `pnpm` (nhanh, tiết kiệm dung lượng đĩa cứng).
- **Cơ sở dữ liệu (Database):** [PostgreSQL](https://www.postgresql.org/) (Hệ quản trị CSDL quan hệ mạnh mẽ).
- **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/) (Công cụ tương tác với Database type-safe).
- **Xác thực (Authentication):** `JWT` (JSON Web Tokens) kết hợp với `@nestjs/passport`.
- **Tài liệu API (API Documentation):** [Swagger](https://swagger.io/) (Tự động sinh tài liệu API UI tại route `/api`).
- **Bảo mật & Kiểm tra dữ liệu (Validation):** `class-validator` và `class-transformer` kết hợp Global Validation Pipes của NestJS.
- **Quản lý biến môi trường:** `@nestjs/config` (để load file `.env`).

---

## 🎨 2. Frontend (Đã thiết lập)

Frontend được cấu trúc theo dạng Monorepo sử dụng Turborepo, giúp quản lý source code quy mô lớn dễ dàng.

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Version 6.x)
- **Framework chính:** [Next.js](https://nextjs.org/) (Version 16.x)
- **Thư viện UI:** [React](https://react.dev/) (Version 19.x)
- **Kiến trúc (Architecture):** [Turborepo](https://turbo.build/) (Monorepo architecture)
- **Package Manager:** `pnpm` (sử dụng tính năng pnpm workspaces)
- **Styling (Giao diện):** [Tailwind CSS](https://tailwindcss.com/) (Version 4.x - PostCSS)
- **Linting & Formatting:** ESLint (Version 9) và Prettier

---

## 🛠️ 3. Môi trường phát triển & Tooling
- **Editor:** Visual Studio Code.
- **Môi trường Database Local:** Laragon (Cung cấp sẵn dịch vụ PostgreSQL).
- **Quản lý Database GUI:** HeidiSQL, pgAdmin hoặc DBeaver.
- **Quản lý phiên bản (Version Control):** Git & GitHub.
