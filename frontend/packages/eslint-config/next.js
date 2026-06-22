import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * Cấu hình ESLint cho app Next.js.
 *
 * Từ Next 16, eslint-config-next hỗ trợ "flat config" GỐC nên ta import
 * trực tiếp các mảng config, không cần FlatCompat (cây cầu cho định dạng cũ).
 *
 * - core-web-vitals: rule chất lượng + hiệu năng (ảnh hưởng điểm Core Web Vitals)
 * - typescript: rule dành cho TypeScript
 * - eslintConfigPrettier: đặt CUỐI để tắt các rule format đụng độ với Prettier
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  eslintConfigPrettier,
  {
    ignores: [".next/**", "node_modules/**", ".turbo/**"],
  },
];
