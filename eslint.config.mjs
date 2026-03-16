import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier"; // already ESM-compatible

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      prettier: prettierPlugin, // ✅ no `.default` here
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".cursor/**",
      "package-lock.json",
      ".DS_Store",
      ".next/**",
      ".husky/**",
      ".vscode/**",
    ],
  },
];

export default eslintConfig;
