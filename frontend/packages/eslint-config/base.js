import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Cấu hình ESLint NỀN, dùng cho mọi package TypeScript (không phải Next).
 * Ví dụ sau này: packages/shared, packages/ui...
 *
 * Thứ tự các phần tử trong mảng RẤT quan trọng: phần tử sau ghi đè phần tử trước.
 * Vì vậy eslintConfigPrettier (tắt các rule format xung khắc với Prettier)
 * phải đặt SAU các bộ rule khác.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  // Rule JavaScript khuyến nghị chính thức của ESLint
  js.configs.recommended,
  // Rule TypeScript khuyến nghị của typescript-eslint
  ...tseslint.configs.recommended,
  // Tắt các rule về dấu cách/dấu phẩy... để Prettier lo phần format
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**"],
  },
];
