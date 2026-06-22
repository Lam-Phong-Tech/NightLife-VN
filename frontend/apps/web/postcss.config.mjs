// Tailwind CSS v4 hoạt động như một plugin của PostCSS.
// Khác bản v3: KHÔNG cần file tailwind.config.js, cấu hình nằm ngay trong CSS.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
