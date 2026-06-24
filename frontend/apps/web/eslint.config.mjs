// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// App chỉ cần import cấu hình đã đóng gói sẵn từ package dùng chung.
// Muốn đổi rule cho toàn bộ frontend → sửa trong packages/eslint-config.
import { nextJsConfig } from "@nightlife/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
export default nextJsConfig;
