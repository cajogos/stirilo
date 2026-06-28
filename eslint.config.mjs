import js from "@eslint/js";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "@stylistic": stylistic },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@stylistic/brace-style": ["error", "allman", { allowSingleLine: false }],
    },
  },
);
